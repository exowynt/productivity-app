import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { FocusSession } from '../../shared/types';
import { useStorage } from '../hooks/useStorage';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type SessionType = 'pomodoro' | 'custom' | 'break';

const BLOCKING_PREF_KEY = 'solitude_website_blocking_enabled';

interface TimerContextValue {
  status: TimerStatus;
  sessionType: SessionType;
  totalDuration: number;
  timeLeft: number;
  elapsedSeconds: number;
  label: string;
  progressPercent: number;
  websiteBlockingEnabled: boolean;
  blockingActiveForSession: boolean;
  blockerError: string | null;
  startSession: (seconds: number, type?: SessionType, customLabel?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  endSession: () => FocusSession | null;
  setLabel: (l: string) => void;
  setWebsiteBlockingEnabled: (enabled: boolean) => void;
  clearBlockerError: () => void;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

// Web Audio API Synthesizer Completion Chime
const playChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.25); // A5 note
    
    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (err) {
    console.warn('Audio chime skipped:', err);
  }
};

/**
 * Calls the main process to disable website blocking.
 * Fire-and-forget: errors are logged but don't interrupt the session lifecycle.
 */
const callDisableBlocking = (): void => {
  if (window.electronAPI?.disableBlocking) {
    window.electronAPI.disableBlocking()
      .then((result) => {
        if (!result.success) {
          console.warn('[WebsiteBlocker] Failed to disable blocking:', result.error);
        }
      })
      .catch((err) => {
        console.warn('[WebsiteBlocker] IPC error disabling blocking:', err);
      });
  }
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addFocusSession } = useStorage();
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [totalDuration, setTotalDuration] = useState<number>(1500); // 25 min default
  const [timeLeft, setTimeLeft] = useState<number>(1500);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [label, setLabel] = useState<string>('Deep Study Session');
  const [startTime, setStartTime] = useState<string | null>(null);

  // Website blocking preference (persisted to localStorage)
  const [websiteBlockingEnabled, setWebsiteBlockingEnabledRaw] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BLOCKING_PREF_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Tracks whether blocking was activated for the *current* session
  const [blockingActiveForSession, setBlockingActiveForSession] = useState<boolean>(false);
  const [blockerError, setBlockerError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Persist blocking preference to localStorage
  const setWebsiteBlockingEnabled = useCallback((enabled: boolean) => {
    setWebsiteBlockingEnabledRaw(enabled);
    if (!enabled) setBlockerError(null);
    try {
      localStorage.setItem(BLOCKING_PREF_KEY, String(enabled));
    } catch {
      // localStorage unavailable — preference won't persist
    }
  }, []);

  const clearBlockerError = useCallback(() => {
    setBlockerError(null);
  }, []);

  // Request browser notification permissions if applicable
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Persistent Timer Countdown Effect at App Root Level
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearTimer();
            setStatus('completed');
            setElapsedSeconds((prevElapsed) => prevElapsed + 1);

            const completedSession: FocusSession = {
              id: Date.now().toString(),
              startTime: startTime || new Date().toISOString(),
              endTime: new Date().toISOString(),
              duration: totalDuration,
              type: sessionType,
              label,
              completed: true,
            };

            // Play completion chime audio
            playChimeSound();

            // Trigger native desktop notification
            const notifTitle = 'Focus Session Completed! 🎉';
            const notifBody = `Great job! You completed your ${label || 'focus'} session.`;

            if (window.electronAPI?.showNotification) {
              window.electronAPI.showNotification(notifTitle, notifBody);
            } else if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(notifTitle, { body: notifBody });
            }

            // Disable website blocking when session completes
            callDisableBlocking();
            setBlockingActiveForSession(false);

            // Save completed session immediately to global storage
            addFocusSession(completedSession);
            return 0;
          }
          setElapsedSeconds((prev) => prev + 1);
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [status, totalDuration, sessionType, label, startTime, addFocusSession]);

  // Update window title with countdown
  useEffect(() => {
    if (status === 'running') {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      document.title = `(${formatted}) Focus Mode — Solitude`;
    } else if (status === 'paused') {
      document.title = `(Paused) Focus Mode — Solitude`;
    } else {
      document.title = 'Personal Productivity Dashboard';
    }
  }, [status, timeLeft]);

  const startSession = useCallback(
    (seconds: number, type: SessionType = 'pomodoro', customLabel = 'Deep Work Session') => {
      clearTimer();
      setTotalDuration(seconds);
      setTimeLeft(seconds);
      setElapsedSeconds(0);
      setSessionType(type);
      setLabel(customLabel);
      setStartTime(new Date().toISOString());
      setStatus('running');
      setBlockerError(null);

      // Enable website blocking if preference is on AND this is not a break session
      if (websiteBlockingEnabled && type !== 'break' && window.electronAPI?.enableBlocking) {
        window.electronAPI.enableBlocking()
          .then((result) => {
            if (result.success) {
              setBlockingActiveForSession(true);
              setBlockerError(null);
              console.log('[WebsiteBlocker] Blocking enabled for session.');
            } else {
              console.warn('[WebsiteBlocker] Failed to enable blocking:', result.error);
              setBlockingActiveForSession(false);
              setBlockerError(result.error || 'Failed to enable website blocking.');
            }
          })
          .catch((err) => {
            console.warn('[WebsiteBlocker] IPC error enabling blocking:', err);
            setBlockingActiveForSession(false);
            setBlockerError('IPC error enabling website blocking.');
          });
      } else {
        setBlockingActiveForSession(false);
      }
    },
    [websiteBlockingEnabled]
  );

  const pauseTimer = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
    }
  }, [status]);

  const resumeTimer = useCallback(() => {
    if (status === 'paused') {
      setStatus('running');
    }
  }, [status]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setStatus('idle');
    setTimeLeft(totalDuration);
    setElapsedSeconds(0);
    setStartTime(null);

    // Disable blocking on reset
    callDisableBlocking();
    setBlockingActiveForSession(false);
  }, [totalDuration]);

  const endSession = useCallback((): FocusSession | null => {
    clearTimer();

    // Disable blocking on manual session end
    callDisableBlocking();
    setBlockingActiveForSession(false);

    const actualDuration = elapsedSeconds > 0 ? elapsedSeconds : (totalDuration - timeLeft);

    if (actualDuration > 0 && (startTime || status !== 'idle')) {
      const recordedSession: FocusSession = {
        id: Date.now().toString(),
        startTime: startTime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: actualDuration,
        type: sessionType,
        label,
        completed: status === 'completed' || timeLeft === 0,
      };

      addFocusSession(recordedSession);

      setStatus('idle');
      setTimeLeft(totalDuration);
      setElapsedSeconds(0);
      setStartTime(null);

      return recordedSession;
    }

    setStatus('idle');
    setTimeLeft(totalDuration);
    setElapsedSeconds(0);
    setStartTime(null);
    return null;
  }, [elapsedSeconds, totalDuration, timeLeft, startTime, status, sessionType, label, addFocusSession]);

  const progressPercent = totalDuration > 0
    ? Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100))
    : 0;

  return (
    <TimerContext.Provider
      value={{
        status,
        sessionType,
        totalDuration,
        timeLeft,
        elapsedSeconds,
        label,
        progressPercent,
        websiteBlockingEnabled,
        blockingActiveForSession,
        blockerError,
        startSession,
        pauseTimer,
        resumeTimer,
        resetTimer,
        endSession,
        setLabel,
        setWebsiteBlockingEnabled,
        clearBlockerError,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export function useGlobalTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useGlobalTimer must be used within a TimerProvider');
  }
  return context;
}
