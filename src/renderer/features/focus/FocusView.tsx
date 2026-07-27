import React, { useState, useEffect } from 'react';
import { useTimer, SessionType } from '../../hooks/useTimer';
import { useStorage } from '../../hooks/useStorage';
import {
  formatMMSS,
  formatHumanDuration,
  calculateTodayFocusTime,
  calculateWeeklyFocusTime,
  calculateStreakDays,
} from '../../utils/focusMetrics';
import {
  IconPlay,
  IconPause,
  IconRotateCcw,
  IconCheck,
  IconTrash,
  IconFlame,
  IconClock,
  IconFocus,
  IconShield,
  IconPlus,
} from '../../components/ui/Icons';
import { FocusSession } from '../../../shared/types';

export const FocusView: React.FC = () => {
  const { data, addFocusSession, deleteFocusSession, addBlockedSite, removeBlockedSite } = useStorage();
  const [selectedLabel, setSelectedLabel] = useState<string>('Deep Study Session');
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('30');
  const [newDomainInput, setNewDomainInput] = useState<string>('');
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);

  const blockedSites = data.blockedSites || [];

  // Timer completion handler
  const handleComplete = (session: FocusSession) => {
    addFocusSession(session);
    if (window.electronAPI) {
      window.electronAPI.stopWebsiteBlocker();
      setIsShieldActive(false);
    }
  };

  const {
    status,
    sessionType,
    totalDuration,
    timeLeft,
    progressPercent,
    startSession,
    pauseTimer,
    resumeTimer,
    resetTimer,
    endSession,
  } = useTimer({ onComplete: handleComplete });

  // Activate/deactivate Website Blocker when timer status changes
  useEffect(() => {
    if (status === 'running') {
      if (window.electronAPI) {
        window.electronAPI.startWebsiteBlocker(blockedSites).then((res) => {
          setIsShieldActive(res?.active || false);
        });
      }
      document.title = `(${formatMMSS(timeLeft)}) Focus Mode — Solitude`;
    } else if (status === 'paused') {
      document.title = `(Paused) Focus Mode — Solitude`;
    } else {
      if (window.electronAPI) {
        window.electronAPI.stopWebsiteBlocker().then(() => {
          setIsShieldActive(false);
        });
      }
      document.title = 'Personal Productivity Dashboard';
    }
  }, [status, timeLeft, blockedSites]);

  // Handle Preset Clicks
  const handlePresetSelect = (minutes: number, type: SessionType = 'pomodoro', defaultLabel?: string) => {
    const labelToUse = defaultLabel || selectedLabel;
    startSession(minutes * 60, type, labelToUse);
  };

  // Handle Custom Minutes Start
  const handleCustomStart = () => {
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins > 0) {
      startSession(mins * 60, 'custom', selectedLabel);
    }
  };

  // Handle End & Save Session manually
  const handleManualSave = () => {
    const recorded = endSession();
    if (recorded) {
      addFocusSession(recorded);
    }
    if (window.electronAPI) {
      window.electronAPI.stopWebsiteBlocker();
      setIsShieldActive(false);
    }
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDomainInput.trim()) {
      addBlockedSite(newDomainInput);
      setNewDomainInput('');
    }
  };

  // Metrics calculation
  const todaySeconds = calculateTodayFocusTime(data.focusSessions);
  const weeklySeconds = calculateWeeklyFocusTime(data.focusSessions);
  const streakDays = calculateStreakDays(data.focusSessions);
  const totalSessionsCount = (data.focusSessions || []).filter((s) => s.type !== 'break').length;

  return (
    <div className="focus-container animate-fade-in">
      {/* Top Metrics Row */}
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
            <span className="metric-label">This Week</span>
            <span className="metric-value">{formatHumanDuration(weeklySeconds)}</span>
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

      {/* Main Focus Ring Centerpiece */}
      <div className="glass-card focus-centerpiece">
        <div className="focus-header">
          <div className="session-category-select">
            <label htmlFor="session-label-input">Session Goal:</label>
            <input
              id="session-label-input"
              type="text"
              className="category-input"
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              placeholder="e.g. Deep Study, Coding, Math Review"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isShieldActive && (
              <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <IconShield size={13} /> Shield Active ({blockedSites.length})
              </span>
            )}
            <div className={`status-badge status-${status}`}>
              <span className="status-dot" />
              <span>{status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="timer-ring-container">
          <svg className="timer-ring-svg" viewBox="0 0 280 280">
            {/* Background track */}
            <circle
              className="ring-bg"
              cx="140"
              cy="140"
              r="120"
              strokeWidth="12"
            />
            {/* Active progress stroke */}
            <circle
              className="ring-progress"
              cx="140"
              cy="140"
              r="120"
              strokeWidth="12"
              style={{
                strokeDasharray: 2 * Math.PI * 120,
                strokeDashoffset: 2 * Math.PI * 120 * (1 - progressPercent / 100),
              }}
            />
          </svg>

          <div className="ring-content">
            <div className="time-display">{formatMMSS(timeLeft)}</div>
            <div className="session-type-label">
              {sessionType === 'break' ? '☕ Short Break' : selectedLabel}
            </div>
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="presets-row">
          <button
            onClick={() => handlePresetSelect(15, 'custom', 'Quick Focus (15m)')}
            className={`preset-btn ${totalDuration === 900 && sessionType !== 'break' ? 'active' : ''}`}
          >
            15 Min
          </button>
          <button
            onClick={() => handlePresetSelect(25, 'pomodoro', 'Pomodoro (25m)')}
            className={`preset-btn ${totalDuration === 1500 && sessionType === 'pomodoro' ? 'active' : ''}`}
          >
            25 Min (Pomo)
          </button>
          <button
            onClick={() => handlePresetSelect(45, 'custom', 'Deep Session (45m)')}
            className={`preset-btn ${totalDuration === 2700 ? 'active' : ''}`}
          >
            45 Min
          </button>
          <button
            onClick={() => handlePresetSelect(60, 'custom', 'Power Hour (60m)')}
            className={`preset-btn ${totalDuration === 3600 ? 'active' : ''}`}
          >
            60 Min
          </button>
          <button
            onClick={() => handlePresetSelect(5, 'break', 'Short Break (5m)')}
            className={`preset-btn break-preset ${sessionType === 'break' ? 'active' : ''}`}
          >
            5m Break ☕
          </button>

          {/* Custom Input */}
          <div className="custom-preset-box">
            <input
              type="number"
              min="1"
              max="300"
              value={customMinutesInput}
              onChange={(e) => setCustomMinutesInput(e.target.value)}
              className="custom-min-input"
            />
            <span className="min-suffix">m</span>
            <button onClick={handleCustomStart} className="btn-secondary btn-sm">
              Set
            </button>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="timer-controls">
          {status === 'idle' && (
            <button onClick={() => startSession(totalDuration, sessionType, selectedLabel)} className="btn btn-primary btn-large">
              <IconPlay size={20} />
              <span>Start Focus</span>
            </button>
          )}

          {status === 'running' && (
            <button onClick={pauseTimer} className="btn btn-secondary btn-large">
              <IconPause size={20} />
              <span>Pause</span>
            </button>
          )}

          {status === 'paused' && (
            <button onClick={resumeTimer} className="btn btn-primary btn-large">
              <IconPlay size={20} />
              <span>Resume</span>
            </button>
          )}

          {(status === 'running' || status === 'paused') && (
            <button onClick={handleManualSave} className="btn btn-secondary btn-large btn-success-action" title="Finish and log elapsed focus time">
              <IconCheck size={20} />
              <span>End & Log Session</span>
            </button>
          )}

          {status !== 'idle' && (
            <button onClick={resetTimer} className="btn-icon" title="Reset Timer">
              <IconRotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Website Shield Manager Card */}
      <div className="glass-card session-history-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconShield size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Website Blocker Shield</span>
            </h3>
            <p className="section-subtitle">
              Distraction sites blocked automatically while your Focus timer is running.
            </p>
          </div>
          <span className="badge badge-primary">{blockedSites.length} Blocked Domains</span>
        </div>

        <form onSubmit={handleAddDomain} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <input
            type="text"
            className="category-input"
            style={{ flex: 1 }}
            placeholder="Add website to block (e.g. youtube.com, reddit.com, twitter.com)"
            value={newDomainInput}
            onChange={(e) => setNewDomainInput(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" style={{ gap: '0.35rem' }}>
            <IconPlus size={16} />
            <span>Add Domain</span>
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {blockedSites.map((domain) => (
            <span
              key={domain}
              className="chip-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                fontSize: '0.85rem',
              }}
            >
              <span>{domain}</span>
              <button
                onClick={() => removeBlockedSite(domain)}
                className="btn-icon-danger"
                style={{ padding: '0.1rem', cursor: 'pointer' }}
                title={`Remove ${domain}`}
              >
                <IconTrash size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Session History Table */}
      <div className="glass-card session-history-card">
        <h3 className="section-title">Focus History Log</h3>
        
        {(!data.focusSessions || data.focusSessions.length === 0) ? (
          <p className="empty-log-text">No recorded focus sessions yet today. Start a session above to log your study time!</p>
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
                {data.focusSessions.slice(0, 10).map((session) => {
                  const dateObj = new Date(session.startTime);
                  const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const dateFormatted = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

                  return (
                    <tr key={session.id}>
                      <td>
                        <span className="log-date">{dateFormatted}</span>{' '}
                        <span className="log-time">{timeFormatted}</span>
                      </td>
                      <td className="log-label">{session.label || 'General Focus'}</td>
                      <td>
                        <span className={`badge ${session.type === 'break' ? 'badge-break' : 'badge-primary'}`}>
                          {session.type}
                        </span>
                      </td>
                      <td className="log-duration">{formatHumanDuration(session.duration)}</td>
                      <td>
                        <button
                          onClick={() => deleteFocusSession(session.id)}
                          className="btn-icon-danger"
                          title="Delete Session Log"
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
