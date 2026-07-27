import React, { useState, useEffect } from 'react';
import { IconSun, IconMoon, IconPalette } from '../ui/Icons';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  activeTabLabel: string;
  onOpenThemeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTabLabel, onOpenThemeModal }) => {
  const [now, setNow] = useState(new Date());
  const { activePreset, setTheme } = useTheme();

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

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-greeting">
          <span className="greeting-sub">{formatDate(now)}</span>
          <h2 className="greeting-title">{getGreeting()}, Developer</h2>
        </div>
      </div>

      <div className="header-center">
        <div className="focus-pill">
          <span className="focus-dot" />
          <span className="focus-question">What should I be doing right now?</span>
        </div>
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
