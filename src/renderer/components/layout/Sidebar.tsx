import React from 'react';
import {
  IconHome,
  IconFocus,
  IconTasks,
  IconNotes,
  IconBible,
  IconStats,
  IconSparkles,
} from '../ui/Icons';

export type NavTab = 'dashboard' | 'focus' | 'tasks' | 'notes' | 'bible' | 'stats';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Home Dashboard', icon: <IconHome size={20} /> },
    { id: 'focus', label: 'Focus Mode', icon: <IconFocus size={20} />, badge: 'Priority' },
    { id: 'tasks', label: "Today's Tasks", icon: <IconTasks size={20} /> },
    { id: 'notes', label: 'Quick Notes', icon: <IconNotes size={20} /> },
    { id: 'bible', label: 'Bible & Reflection', icon: <IconBible size={20} /> },
    { id: 'stats', label: 'Study Analytics', icon: <IconStats size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">
          <IconSparkles size={22} />
        </div>
        <div className="brand-text">
          <span className="brand-name">Solitude</span>
          <span className="brand-sub">Productivity Hub</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`nav-btn ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="quote-micro">
          <span>"What should I be doing right now?"</span>
        </div>
      </div>
    </aside>
  );
};
