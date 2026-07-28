import React, { useState, useEffect } from 'react';
import { IconSun, IconMoon, IconPalette, IconClock } from '../ui/Icons';
import { useTheme } from '../../hooks/useTheme';
import { useGlobalTimer } from '../../context/TimerContext';
import { formatMMSS } from '../../utils/focusMetrics';

interface HeaderProps {
  activeTabLabel: string;
  onOpenThemeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTabLabel, onOpenThemeModal }) => {
  const [now, setNow] = useState(new Date());
  const { activePreset, setTheme } = useTheme();
  const { status, timeLeft, label } = useGlobalTimer();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hours = now.getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const toggleLightDark = () => {
    if (activePreset.mode === 'dark') {
      setTheme('paper-ink');
    } else {
      setTheme('midnight-slate');
    }
  };

  const isTimerActive = status === 'running' || status === 'paused';

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-greeting">
          <span className="greeting-sub">{formatDate(now)}</span>
          <h2 className="greeting-title">{getGreeting()}, Developer</h2>
        </div>
      </div>

      <div className="header-center">
        {isTimerActive ? (
          <div className="focus-pill active-timer-pill">
            <span className={`focus-dot status-dot-${status}`} />
            <IconClock size={16} className="timer-icon-spin" />
            <span className="live-timer-text">{formatMMSS(timeLeft)}</span>
            <span className="live-timer-label">— {label}</span>
          </div>
        ) : (
          <div className="focus-pill">
            <span className="focus-dot" />
            <span className="focus-question">Focus Mode — Solitude</span>
          </div>
        )}
      </div>

      <div className="header-right">
        <div className="view-indicator">{activeTabLabel}</div>

        <button
          onClick={onOpenThemeModal}
          className="btn-icon theme-palette-btn"
          title={`Theme Presets (${activePreset.name})`}
        >
          <IconPalette size={18} />
        </button>

        <button
          onClick={toggleLightDark}
          className="btn-icon theme-toggle"
          title={`Switch to ${activePreset.mode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {activePreset.mode === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>
      </div>
    </header>
  );
};
