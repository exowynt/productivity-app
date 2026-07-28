import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { Habit } from '../../../shared/types';
import { IconCheckCircle, IconPlus, IconTrash, IconFlame, IconBarChart } from '../../components/ui/Icons';

type Timeframe = 'today' | '7d' | 'monthly';

export const HabitsView: React.FC = () => {
  const { data, addHabit, toggleHabitDate, deleteHabit } = useStorage();
  const habits = data.habits || [];

  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState<Habit['color']>('indigo');
  const [isCreating, setIsCreating] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: calculate streak for a habit
  const getHabitStreak = (completedDates: string[]): number => {
    let streak = 0;
    const date = new Date();

    // Check today first, if not completed today check yesterday
    let checkStr = date.toISOString().split('T')[0];
    if (!completedDates.includes(checkStr)) {
      date.setDate(date.getDate() - 1);
      checkStr = date.toISOString().split('T')[0];
    }

    while (completedDates.includes(checkStr)) {
      streak++;
      date.setDate(date.getDate() - 1);
      checkStr = date.toISOString().split('T')[0];
    }

    return streak;
  };

  // Helper: generate last N date strings YYYY-MM-DD
  const getLastNDates = (n: number): string[] => {
    const dates: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await addHabit(newHabitName.trim(), selectedColor);
    setNewHabitName('');
    setIsCreating(false);
  };

  const todayCompletedCount = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const todayProgressPercent = habits.length > 0 ? Math.round((todayCompletedCount / habits.length) * 100) : 0;

  const past7Dates = getLastNDates(7);
  const past30Dates = getLastNDates(30);

  return (
    <div className="habits-container animate-fade-in">
      {/* Header Card */}
      <div className="glass-card habits-header-card">
        <div className="habits-header-left">
          <div className="header-icon-box habits-icon-box">
            <IconCheckCircle size={24} />
          </div>
          <div>
            <h2>Long-Term Habit Tracker</h2>
            <p className="section-subtitle">Build consistency, track daily streaks, and analyze long-term habits.</p>
          </div>
        </div>

        <div className="progress-box">
          <div className="progress-text">
            <span>Today's Habits Completed</span>
            <span className="percent-text">{todayCompletedCount}/{habits.length} ({todayProgressPercent}%)</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${todayProgressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Action Bar & Timeframe Filters */}
      <div className="glass-card habits-control-card">
        <div className="habits-control-row">
          <div className="timeframe-buttons">
            <span className="timeframe-label"><IconBarChart size={16} /> Analytics View:</span>
            <button
              className={`chip-btn ${timeframe === 'today' ? 'active' : ''}`}
              onClick={() => setTimeframe('today')}
            >
              Today
            </button>
            <button
              className={`chip-btn ${timeframe === '7d' ? 'active' : ''}`}
              onClick={() => setTimeframe('7d')}
            >
              Past 7 Days
            </button>
            <button
              className={`chip-btn ${timeframe === 'monthly' ? 'active' : ''}`}
              onClick={() => setTimeframe('monthly')}
            >
              Monthly (30 Days)
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => setIsCreating(!isCreating)}>
            <IconPlus size={18} /> {isCreating ? 'Cancel' : 'New Habit'}
          </button>
        </div>

        {/* New Habit Form */}
        {isCreating && (
          <form onSubmit={handleCreateHabit} className="new-habit-form animate-fade-in">
            <input
              type="text"
              className="task-input"
              placeholder="e.g., Read 20 pages, 30m Workout, Morning Prayer..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              autoFocus
            />

            <div className="color-picker-row">
              <span className="color-label">Color Theme:</span>
              {(['indigo', 'emerald', 'amber', 'rose', 'cyan', 'violet'] as Habit['color'][]).map((c) => (
                <span
                  key={c}
                  className={`color-dot color-${c} ${selectedColor === c ? 'active' : ''}`}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>

            <button type="submit" className="btn btn-primary btn-sm">
              Save Habit
            </button>
          </form>
        )}
      </div>

      {/* Habits List & Streak Grid */}
      <div className="glass-card habits-list-card">
        <h3 className="section-title">Today's Habits Checklist</h3>

        {habits.length === 0 ? (
          <div className="empty-widget-box">
            <p className="widget-empty-text">No active habits yet. Click "+ New Habit" above to start building your routine!</p>
          </div>
        ) : (
          <div className="habits-grid">
            {habits.map((habit) => {
              const isDoneToday = habit.completedDates.includes(todayStr);
              const streak = getHabitStreak(habit.completedDates);

              return (
                <div key={habit.id} className={`habit-card color-${habit.color} ${isDoneToday ? 'done' : ''}`}>
                  <div className="habit-card-header">
                    <div className="habit-title-box">
                      <div
                        className={`habit-checkbox ${isDoneToday ? 'checked' : ''}`}
                        onClick={() => toggleHabitDate(habit.id, todayStr)}
                      >
                        {isDoneToday && <IconCheckCircle size={16} />}
                      </div>
                      <span className="habit-name">{habit.name}</span>
                    </div>

                    <button
                      className="btn-icon-danger"
                      onClick={() => deleteHabit(habit.id)}
                      title="Delete Habit"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>

                  <div className="habit-card-footer">
                    <span className="habit-streak-badge">
                      <IconFlame size={14} /> {streak}d Streak
                    </span>
                    <button
                      className={`btn btn-sm ${isDoneToday ? 'btn-secondary' : 'btn-success-action'}`}
                      onClick={() => toggleHabitDate(habit.id, todayStr)}
                    >
                      {isDoneToday ? 'Completed Today ✓' : 'Mark Done Today'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Long-Term Analytics Charts (Today, 7D, Monthly) */}
      <div className="glass-card habit-analytics-card">
        <div className="chart-header">
          <div>
            <h3 className="section-title">Long-Term Consistency Analytics</h3>
            <p className="section-subtitle">
              {timeframe === 'today' && 'Completion breakdown for today.'}
              {timeframe === '7d' && 'Habit completion matrix over the past 7 days.'}
              {timeframe === 'monthly' && '30-day activity trend & consistency metrics.'}
            </p>
          </div>
          <span className="chart-subtitle-tag">{timeframe.toUpperCase()} VIEW</span>
        </div>

        {habits.length === 0 ? (
          <div className="empty-widget-box">
            <p className="widget-empty-text">Add habits to view long-term analytics charts.</p>
          </div>
        ) : (
          <>
            {timeframe === 'today' && (
              <div className="habit-today-analytics">
                {habits.map((habit) => {
                  const done = habit.completedDates.includes(todayStr);
                  return (
                    <div key={habit.id} className="analytics-habit-row">
                      <div className="analytics-habit-name">
                        <span className={`color-dot color-${habit.color}`} />
                        <span>{habit.name}</span>
                      </div>
                      <span className={`badge ${done ? 'badge-primary' : 'badge-break'}`}>
                        {done ? 'Done Today ✓' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {timeframe === '7d' && (
              <div className="matrix-chart-container">
                <div className="matrix-dates-header">
                  <span className="matrix-habit-col-title">Habit</span>
                  {past7Dates.map((d) => {
                    const dayLabel = new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
                    const isToday = d === todayStr;
                    return (
                      <span key={d} className={`matrix-date-cell ${isToday ? 'today-col' : ''}`}>
                        {dayLabel}
                      </span>
                    );
                  })}
                  <span className="matrix-score-col">7d Rate</span>
                </div>

                {habits.map((habit) => {
                  const completed7Count = past7Dates.filter((d) => habit.completedDates.includes(d)).length;
                  const rate7Percent = Math.round((completed7Count / 7) * 100);

                  return (
                    <div key={habit.id} className="matrix-habit-row">
                      <span className="matrix-habit-name">{habit.name}</span>
                      {past7Dates.map((d) => {
                        const isDone = habit.completedDates.includes(d);
                        return (
                          <div
                            key={d}
                            className={`matrix-check-cell ${isDone ? `done-${habit.color}` : ''}`}
                            onClick={() => toggleHabitDate(habit.id, d)}
                            title={`${d}: ${isDone ? 'Completed' : 'Missed'} (Click to toggle)`}
                          >
                            {isDone ? '✓' : '•'}
                          </div>
                        );
                      })}
                      <span className="matrix-rate">{rate7Percent}%</span>
                    </div>
                  );
                })}
              </div>
            )}

            {timeframe === 'monthly' && (
              <div className="monthly-chart-container">
                <div className="monthly-summary-row">
                  {habits.map((habit) => {
                    const completed30Count = past30Dates.filter((d) => habit.completedDates.includes(d)).length;
                    const rate30Percent = Math.round((completed30Count / 30) * 100);

                    return (
                      <div key={habit.id} className="monthly-habit-summary">
                        <div className="monthly-habit-header">
                          <span className="monthly-habit-title">{habit.name}</span>
                          <span className="monthly-habit-rate">{completed30Count}/30 days ({rate30Percent}%)</span>
                        </div>

                        {/* 30-day heatmap grid */}
                        <div className="heatmap-grid">
                          {past30Dates.map((d) => {
                            const isDone = habit.completedDates.includes(d);
                            return (
                              <div
                                key={d}
                                className={`heatmap-cell ${isDone ? `active-${habit.color}` : ''}`}
                                onClick={() => toggleHabitDate(habit.id, d)}
                                title={`${d}: ${isDone ? 'Completed' : 'Missed'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
