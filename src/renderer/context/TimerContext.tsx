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

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addFocusSession } = useStorage();
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('pomodoro');
  const [totalDuration, setTotalDuration] = useState<number>(1500); // 25 min default
  const [timeLeft, setTimeLeft] = useState<number>(1500);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [label, setLabel] = useState<string>('Deep Work Session');
  const [startTime, setStartTime] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

            // Trigger desktop notification
            if (window.electronAPI?.showNotification) {
              window.electronAPI.showNotification(
                'Focus Session Completed! 🎉',
                `Great job! You completed your ${label || 'focus'} session.`
              );
            }

            // Save completed session
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
  }, [elapsedSeconds, startTime, sessionType, label, status, timeLeft, totalDuration, addFocusSession]);

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
