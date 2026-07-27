import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { FocusSession } from '../../shared/types';
import { useStorage } from '../hooks/useStorage';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type SessionType = 'pomodoro' | 'custom' | 'break';

interface TimerContextValue {
  status: TimerStatus;
  sessionType: SessionType;
  totalDuration: number;
  timeLeft: number;
  elapsedSeconds: number;
  label: string;
  progressPercent: number;
  startSession: (seconds: number, type?: SessionType, customLabel?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  endSession: () => FocusSession | null;
  setLabel: (l: string) => void;
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

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addFocusSession } = useStorage();
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [totalDuration, setTotalDuration] = useState<number>(1500); // 25 min default
  const [timeLeft, setTimeLeft] = useState<number>(1500);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [label, setLabel] = useState<string>('Deep Study Session');
  const [startTime, setStartTime] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    },
    []
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
  }, [totalDuration]);

  const endSession = useCallback((): FocusSession | null => {
    clearTimer();

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
        startSession,
        pauseTimer,
        resumeTimer,
        resetTimer,
        endSession,
        setLabel,
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
