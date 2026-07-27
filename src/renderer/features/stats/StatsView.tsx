import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import {
  calculateTodayFocusTime,
  calculateWeeklyFocusTime,
  calculateMonthlyFocusTime,
  calculateStreakDays,
  formatHumanDuration,
} from '../../utils/focusMetrics';
import {
  IconClock,
  IconFlame,
  IconFocus,
  IconCheck,
  IconStats,
  IconTrash,
} from '../../components/ui/Icons';

export const StatsView: React.FC = () => {
  const { data, deleteFocusSession } = useStorage();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');

  const sessions = (data.focusSessions || []).filter((s) => s.type !== 'break');

  // Key Aggregated Metrics
  const todaySeconds = calculateTodayFocusTime(data.focusSessions);
  const weeklySeconds = calculateWeeklyFocusTime(data.focusSessions);
  const monthlySeconds = calculateMonthlyFocusTime(data.focusSessions);
  const streakDays = calculateStreakDays(data.focusSessions);

  const totalSessionsCount = sessions.length;
  const totalSecondsAllTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const avgSessionSeconds = totalSessionsCount > 0 ? Math.round(totalSecondsAllTime / totalSessionsCount) : 0;

  // Day of week breakdown for bar chart (Mon - Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const getWeeklyBarData = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun, 1 is Mon
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const mondayDate = new Date(today);
    mondayDate.setDate(today.getDate() + mondayOffset);
    mondayDate.setHours(0, 0, 0, 0);

    const result = daysOfWeek.map((dayName, idx) => {
      const dayDate = new Date(mondayDate);
      dayDate.setDate(mondayDate.getDate() + idx);

      const daySeconds = sessions
        .filter((s) => {
          const d = new Date(s.startTime);
          return (
            d.getDate() === dayDate.getDate() &&
            d.getMonth() === dayDate.getMonth() &&
            d.getFullYear() === dayDate.getFullYear()
          );
        })
        .reduce((acc, s) => acc + (s.duration || 0), 0);

      return {
        day: dayName,
        minutes: Math.round(daySeconds / 60),
      };
    });

    const maxMins = Math.max(...result.map((r) => r.minutes), 60); // minimum 60m height scale
    return { result, maxMins };
  };

  const { result: barChartData, maxMins } = getWeeklyBarData();

  // Category breakdown calculation
  const getCategoryBreakdown = () => {
    const map: Record<string, number> = {};
    sessions.forEach((s) => {
      const cat = s.label || 'General Focus';
      map[cat] = (map[cat] || 0) + (s.duration || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div className="stats-container animate-fade-in">
      {/* Header Strip */}
      <div className="glass-card stats-header-card">
        <div className="stats-header-left">
          <div className="header-icon-box stats-icon-box">
            <IconStats size={24} />
          </div>
          <div>
            <h2 className="section-title">Study Statistics & Analytics</h2>
            <p className="section-subtitle">
              Track your focus consistency, session lengths, and weekly productivity trends over time.
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics Grid */}
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
            <span className="metric-label">Current Streak</span>
            <span className="metric-value">{streakDays} {streakDays === 1 ? 'Day' : 'Days'} 🔥</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon info">
            <IconFocus size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Avg Session</span>
            <span className="metric-value">{formatHumanDuration(avgSessionSeconds)}</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon success">
            <IconCheck size={20} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Total Sessions</span>
            <span className="metric-value">{totalSessionsCount}</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="stats-main-grid">
        {/* Weekly Bar Chart Card */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <h3>Weekly Focus Distribution</h3>
            <span className="chart-subtitle-tag">This Week ({formatHumanDuration(weeklySeconds)})</span>
          </div>

          <div className="bar-chart-container">
            {barChartData.map((item) => {
              const heightPercent = maxMins > 0 ? Math.round((item.minutes / maxMins) * 100) : 0;
              return (
                <div key={item.day} className="bar-column">
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${heightPercent}%` }}
                      title={`${item.day}: ${item.minutes} minutes`}
                    />
                  </div>
                  <span className="bar-label">{item.day}</span>
                  <span className="bar-val">{item.minutes > 0 ? `${item.minutes}m` : '-'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div className="glass-card breakdown-card">
          <h3 className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Focus Session Categories
          </h3>

          {categoryBreakdown.length === 0 ? (
            <p className="empty-log-text">No category data recorded yet.</p>
          ) : (
            <div className="category-list">
              {categoryBreakdown.map(([category, seconds]) => {
                const percent = totalSecondsAllTime > 0 ? Math.round((seconds / totalSecondsAllTime) * 100) : 0;
                return (
                  <div key={category} className="category-item">
                    <div className="category-header-row">
                      <span className="cat-name">{category}</span>
                      <span className="cat-dur">{formatHumanDuration(seconds)} ({percent}%)</span>
                    </div>
                    <div className="cat-track">
                      <div className="cat-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Complete Focus Session Log */}
      <div className="glass-card session-history-card">
        <h3 className="section-title">All Time Focus Session Records ({sessions.length})</h3>

        {sessions.length === 0 ? (
          <p className="empty-log-text">No completed focus sessions logged yet.</p>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Session Goal</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const dateObj = new Date(s.startTime);
                  const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateFormatted = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <tr key={s.id}>
                      <td>
                        <span className="log-date">{dateFormatted}</span>{' '}
                        <span className="log-time">{timeFormatted}</span>
                      </td>
                      <td className="log-label">{s.label || 'General Focus'}</td>
                      <td>
                        <span className="badge badge-primary">{s.type}</span>
                      </td>
                      <td className="log-duration">{formatHumanDuration(s.duration)}</td>
                      <td>
                        <button
                          onClick={() => deleteFocusSession(s.id)}
                          className="btn-icon-danger"
                          title="Delete Session"
                        >
                          <IconTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
