import React, { useState, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { calculateStreakDays } from '../../utils/focusMetrics';
import { getVerseOfTheDay, getRandomVerse, getQuoteOfTheDay, DailyVerse } from '../../utils/dailyInspiration';
import {
  IconPlay,
  IconFlame,
  IconCheck,
  IconTasks,
  IconBible,
  IconQuote,
  IconHeart,
  IconArrowRight,
  IconRefresh,
} from '../../components/ui/Icons';
import { NavTab } from '../../components/layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { data, toggleTask } = useStorage();
  const [isQuoteFavorited, setIsQuoteFavorited] = useState(false);
  const [verse, setVerse] = useState<DailyVerse>(() => getVerseOfTheDay());

  const quote = getQuoteOfTheDay();

  // Metrics
  const streakDays = calculateStreakDays(data.focusSessions);
  const tasks = data.tasks || [];
  const completedTasksCount = tasks.filter((t) => t.completed).length;

  const handleRefreshVerse = () => {
    setVerse((prev) => getRandomVerse(prev.id));
  };

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
      {/* Minimal Header Strip */}
      <div className="glass-card dashboard-hero-minimal">
        <div className="hero-left">
          <div className="hero-date-row">
            <span className="hero-date-text">{formattedDate.toUpperCase()}</span>
            {streakDays > 0 && (
              <span className="streak-badge-compact" title={`${streakDays} Day Study Streak`}>
                <IconFlame size={13} /> {streakDays}d Streak
              </span>
            )}
          </div>
          <h1 className="hero-title-minimal">{getGreeting()}, Developer</h1>
        </div>

        <button onClick={() => onNavigate('focus')} className="btn btn-primary btn-large">
          <IconPlay size={18} />
          <span>Start Focus Session</span>
        </button>
      </div>

      {/* Main 2-Column Minimal Layout */}
      <div className="dashboard-main-grid">
        {/* Left Column: Quiet Reflection & Quote */}
        <div className="dashboard-column">
          {/* Verse of the Day Card */}
          <div className="glass-card inspiration-card verse-card">
            <div className="card-top-label">
              <span className="badge badge-primary">
                <IconBible size={14} /> Verse of the Day
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="bible-ref-tag">{verse.reference}</span>
                <button
                  onClick={handleRefreshVerse}
                  className="btn-icon-subtle"
                  title="Get a new Bible verse"
                >
                  <IconRefresh size={15} />
                </button>
              </div>
            </div>

            <blockquote className="verse-text">"{verse.text}"</blockquote>

            <div className="card-action-footer">
              <span className="translation-sub">{verse.translation}</span>
              <button onClick={() => onNavigate('bible')} className="btn-secondary btn-sm link-btn">
                <span>Reflect</span>
                <IconArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Daily Quote Card */}
          <div className="glass-card inspiration-card quote-card">
            <div className="card-top-label">
              <span className="badge badge-break">
                <IconQuote size={14} /> Daily Quote
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

        {/* Right Column: Today's Priorities */}
        <div className="dashboard-column">
          <div className="glass-card widget-card">
            <div className="widget-header">
              <div className="widget-title-group">
                <IconTasks size={18} className="widget-icon" />
                <h3>Today's Tasks ({completedTasksCount}/{tasks.length})</h3>
              </div>
              <button onClick={() => onNavigate('tasks')} className="widget-link-btn">
                <span>View All</span>
                <IconArrowRight size={14} />
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-widget-box">
                <p className="widget-empty-text">No tasks added for today yet.</p>
                <button onClick={() => onNavigate('tasks')} className="btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
                  + Add Priority
                </button>
              </div>
            ) : (
              <div className="widget-tasks-list">
                {tasks.slice(0, 5).map((task) => (
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
        </div>
      </div>
    </div>
  );
};
