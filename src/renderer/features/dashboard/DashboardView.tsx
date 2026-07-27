import React, { useState, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import {
  calculateTodayFocusTime,
  calculateStreakDays,
  formatHumanDuration,
} from '../../utils/focusMetrics';
import {
  getVerseOfTheDay,
  getQuoteOfTheDay,
} from '../../utils/dailyInspiration';
import {
  IconPlay,
  IconClock,
  IconFlame,
  IconCheck,
  IconTasks,
  IconNotes,
  IconBible,
  IconQuote,
  IconHeart,
  IconArrowRight,
} from '../../components/ui/Icons';
import { NavTab } from '../../components/layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { data, toggleTask } = useStorage();
  const [isQuoteFavorited, setIsQuoteFavorited] = useState(false);

  const verse = getVerseOfTheDay();
  const quote = getQuoteOfTheDay();

  // Metrics
  const todaySeconds = calculateTodayFocusTime(data.focusSessions);
  const streakDays = calculateStreakDays(data.focusSessions);
  const tasks = data.tasks || [];
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const notes = data.notes || [];
  const pinnedNotes = notes.filter((n) => n.pinned);

  // Check saved favorites in localStorage
  useEffect(() => {
    try {
      const favsRaw = localStorage.getItem('solitude_fav_quotes');
      if (favsRaw) {
        const favs = JSON.parse(favsRaw) as string[];
        setIsQuoteFavorited(favs.includes(quote.id));
      }
    } catch (e) {
      console.error(e);
    }
  }, [quote.id]);

  const toggleFavoriteQuote = () => {
    try {
      const favsRaw = localStorage.getItem('solitude_fav_quotes');
      let favs: string[] = favsRaw ? JSON.parse(favsRaw) : [];
      if (favs.includes(quote.id)) {
        favs = favs.filter((id) => id !== quote.id);
        setIsQuoteFavorited(false);
      } else {
        favs.push(quote.id);
        setIsQuoteFavorited(true);
      }
      localStorage.setItem('solitude_fav_quotes', JSON.stringify(favs));
    } catch (e) {
      console.error(e);
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="glass-card dashboard-hero">
        <div className="hero-content">
          <span className="hero-date-badge">{formattedDate.toUpperCase()}</span>
          <h1 className="hero-title">{getGreeting()}, Developer</h1>
          <p className="hero-subtitle">
            Welcome to your daily launchpad. Focus on today's priorities and build your momentum.
          </p>
        </div>

        <button onClick={() => onNavigate('focus')} className="btn btn-primary btn-large hero-cta">
          <IconPlay size={20} />
          <span>Start Focus Session</span>
        </button>
      </div>

      {/* Metrics Summary Strip */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon primary">
            <IconClock size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Today's Focus</span>
            <span className="metric-value">{formatHumanDuration(todaySeconds)}</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon warning">
            <IconFlame size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Study Streak</span>
            <span className="metric-value">{streakDays} Days 🔥</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon success">
            <IconTasks size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Tasks Done</span>
            <span className="metric-value">{completedTasksCount} / {tasks.length}</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon info">
            <IconNotes size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Pinned Notes</span>
            <span className="metric-value">{pinnedNotes.length} Notes</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="dashboard-main-grid">
        {/* Left Column: Inspiration */}
        <div className="dashboard-column">
          {/* Verse of the Day Card */}
          <div className="glass-card inspiration-card verse-card">
            <div className="card-top-label">
              <span className="badge badge-primary">
                <IconBible size={14} /> Verse of the Day
              </span>
              <span className="bible-ref-tag">{verse.reference}</span>
            </div>

            <blockquote className="verse-text">"{verse.text}"</blockquote>

            <div className="card-action-footer">
              <span className="translation-sub">{verse.translation} Translation</span>
              <button onClick={() => onNavigate('bible')} className="btn-secondary btn-sm link-btn">
                <span>Reflect in Journal</span>
                <IconArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Daily Quote Card */}
          <div className="glass-card inspiration-card quote-card">
            <div className="card-top-label">
              <span className="badge badge-break">
                <IconQuote size={14} /> Daily Inspiration
              </span>
              <button
                onClick={toggleFavoriteQuote}
                className={`btn-icon-subtle ${isQuoteFavorited ? 'favorited' : ''}`}
                title={isQuoteFavorited ? 'Remove from favorites' : 'Favorite quote'}
              >
                <IconHeart size={16} fill={isQuoteFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>

            <blockquote className="quote-text">"{quote.quote}"</blockquote>
            <span className="quote-author">— {quote.author}</span>
          </div>
        </div>

        {/* Right Column: Today's Priorities & Notes */}
        <div className="dashboard-column">
          {/* Today's Tasks Preview Widget */}
          <div className="glass-card widget-card">
            <div className="widget-header">
              <div className="widget-title-group">
                <IconTasks size={18} className="widget-icon" />
                <h3>Today's Priorities</h3>
              </div>
              <button onClick={() => onNavigate('tasks')} className="widget-link-btn">
                <span>View All</span>
                <IconArrowRight size={14} />
              </button>
            </div>

            {tasks.length === 0 ? (
              <p className="widget-empty-text">No tasks created yet for today.</p>
            ) : (
              <div className="widget-tasks-list">
                {tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className={`widget-task-item ${task.completed ? 'completed' : ''}`}>
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`widget-checkbox ${task.completed ? 'checked' : ''}`}
                    >
                      {task.completed && <IconCheck size={12} />}
                    </button>
                    <span className="widget-task-text">{task.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Notes Quick Preview Widget */}
          <div className="glass-card widget-card">
            <div className="widget-header">
              <div className="widget-title-group">
                <IconNotes size={18} className="widget-icon" />
                <h3>Quick Notes Preview</h3>
              </div>
              <button onClick={() => onNavigate('notes')} className="widget-link-btn">
                <span>View Notes</span>
                <IconArrowRight size={14} />
              </button>
            </div>

            {notes.length === 0 ? (
              <p className="widget-empty-text">No quick notes saved yet.</p>
            ) : (
              <div className="widget-notes-grid">
                {notes.slice(0, 2).map((note) => (
                  <div key={note.id} className={`widget-note-pill color-${note.color || 'indigo'}`}>
                    <span className="widget-note-title">{note.title}</span>
                    <span className="widget-note-snippet">{note.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
