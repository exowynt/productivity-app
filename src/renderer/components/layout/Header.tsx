import React, { useState, useEffect } from 'react';
import { IconSun, IconMoon } from '../ui/Icons';
import { Theme } from '../../hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  activeTabLabel: string;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, activeTabLabel }) => {
  const [now, setNow] = useState(new Date());

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
          onClick={onToggleTheme}
          className="btn-icon theme-toggle"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>
      </div>
    </header>
  );
};
