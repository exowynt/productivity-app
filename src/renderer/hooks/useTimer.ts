import { useState, useEffect, useRef, useCallback } from 'react';
import { FocusSession } from '../../shared/types';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type SessionType = 'pomodoro' | 'custom' | 'break';

interface UseTimerOptions {
  onComplete?: (session: FocusSession) => void;
}

export function useTimer(options?: UseTimerOptions) {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [totalDuration, setTotalDuration] = useState<number>(1500); // 25 min default
  const [timeLeft, setTimeLeft] = useState<number>(1500);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [label, setLabel] = useState<string>('Deep Work Session');
  const [startTime, setStartTime] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(options?.onComplete);
  onCompleteRef.current = options?.onComplete;

  // Clear timer interval helper
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearTimer();
            setStatus('completed');
            setElapsedSeconds((prevElapsed) => prevElapsed + 1);

            // Construct finished session object
            const completedSession: FocusSession = {
              id: Date.now().toString(),
              startTime: startTime || new Date().toISOString(),
              endTime: new Date().toISOString(),
              duration: totalDuration,
              type: sessionType,
              label,
              completed: true,
            };

            // Trigger native desktop notification
            if (window.electronAPI?.showNotification) {
              window.electronAPI.showNotification(
                'Focus Session Completed! 🎉',
                `Great job! You completed your ${label || 'focus'} session.`
              );
            }

            if (onCompleteRef.current) {
              onCompleteRef.current(completedSession);
            }
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
  }, [status, totalDuration, sessionType, label, startTime]);

  // Start new timer session
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

  // Pause active session
  const pauseTimer = useCallback(() => {
    if (status === 'running') {
      setStatus('paused');
    }
  }, [status]);

  // Resume paused session
  const resumeTimer = useCallback(() => {
    if (status === 'paused') {
      setStatus('running');
    }
  }, [status]);

  // Reset timer back to initial duration
  const resetTimer = useCallback(() => {
    clearTimer();
    setStatus('idle');
    setTimeLeft(totalDuration);
    setElapsedSeconds(0);
    setStartTime(null);
  }, [totalDuration]);

  // End session early and record elapsed time
  const endSession = useCallback((): FocusSession | null => {
    clearTimer();

    if (elapsedSeconds > 10 && startTime) {
      const recordedSession: FocusSession = {
        id: Date.now().toString(),
        startTime: startTime,
        endTime: new Date().toISOString(),
        duration: elapsedSeconds,
        type: sessionType,
        label,
        completed: status === 'completed' || timeLeft === 0,
      };

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
  }, [elapsedSeconds, startTime, sessionType, label, status, timeLeft, totalDuration]);

  // Progress percentage (0 to 100)
  const progressPercent = totalDuration > 0
    ? Math.min(100, Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100))
    : 0;

  return {
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
  };
}
