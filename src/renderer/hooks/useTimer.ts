import { useGlobalTimer } from '../context/TimerContext';

export type { TimerStatus, SessionType } from '../context/TimerContext';

export function useTimer() {
  return useGlobalTimer();
}
