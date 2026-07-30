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
  IconX,
} from '../../components/ui/Icons';

/** Default blocked sites — kept in sync with main process for display purposes */
const DEFAULT_BLOCKED_SITES = [
  'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be',
  'reddit.com', 'www.reddit.com', 'old.reddit.com',
  'instagram.com', 'www.instagram.com', 'm.instagram.com',
  'x.com', 'www.x.com', 'twitter.com', 'www.twitter.com',
  'facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.com',
  'tiktok.com', 'www.tiktok.com', 'm.tiktok.com',
];

/** Deduplicate for display — show base domains only */
const DISPLAY_SITES = [...new Set(DEFAULT_BLOCKED_SITES.map((s) => s.replace(/^(www\.|m\.|old\.|music\.|mobile\.|sh\.|pv\.|l\.)/, '')))];

export const FocusView: React.FC = () => {
  const { data, deleteFocusSession } = useStorage();
  const [selectedLabel, setSelectedLabel] = useState<string>('Deep Study Session');
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('30');
  const [adminWarning, setAdminWarning] = useState<string | null>(null);

  const {
    status,
    sessionType,
    totalDuration,
    timeLeft,
    progressPercent,
    websiteBlockingEnabled,
    blockingActiveForSession,
    blockerError,
    startSession,
    pauseTimer,
    resumeTimer,
    resetTimer,
    endSession,
    setWebsiteBlockingEnabled,
    clearBlockerError,
  } = useTimer();

  // Check admin privileges when blocking is toggled on
  useEffect(() => {
    if (websiteBlockingEnabled && window.electronAPI?.checkBlockerAdmin) {
      window.electronAPI.checkBlockerAdmin().then((result) => {
        if (!result.isAdmin) {
          setAdminWarning(result.error || 'Administrator privileges required.');
        } else {
          setAdminWarning(null);
        }
      }).catch(() => {
        setAdminWarning(null);
      });
    } else {
      setAdminWarning(null);
    }
  }, [websiteBlockingEnabled]);

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
    endSession();
  };

  // Metrics calculation
  const todaySeconds = calculateTodayFocusTime(data.focusSessions);
  const weeklySeconds = calculateWeeklyFocusTime(data.focusSessions);
  const streakDays = calculateStreakDays(data.focusSessions);
  const totalSessionsCount = (data.focusSessions || []).filter((s) => s.type !== 'break').length;

  const isSessionActive = status === 'running' || status === 'paused';

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

          <div className={`status-badge status-${status}`}>
            <span className="status-dot" />
            <span>{status.toUpperCase()}</span>
          </div>
        </div>

        {/* Website Blocker Toggle */}
        <div className={`blocker-toggle-row ${websiteBlockingEnabled ? 'active' : ''} ${blockingActiveForSession ? 'session-active' : ''}`}>
          <div className={`blocker-toggle-left ${websiteBlockingEnabled ? 'active' : ''}`}>
            <div className="blocker-shield-icon">
              <IconShield size={18} />
            </div>
            <div className="blocker-toggle-text">
              <span className="blocker-toggle-label">
                {blockingActiveForSession ? 'Sites Blocked 🛡️' : 'Block Distracting Websites'}
              </span>
              <span className="blocker-toggle-sub">
                {blockingActiveForSession
                  ? 'Websites are blocked via system hosts file'
                  : websiteBlockingEnabled
                    ? `${DISPLAY_SITES.length} site families (IPv4 + IPv6 + DoH fallback) will be blocked`
                    : 'Modify system hosts file during focus sessions'
                }
              </span>
            </div>
          </div>

          <button
            className={`toggle-switch ${websiteBlockingEnabled ? 'active' : ''}`}
            onClick={() => setWebsiteBlockingEnabled(!websiteBlockingEnabled)}
            disabled={isSessionActive}
            title={isSessionActive ? 'Cannot change during active session' : websiteBlockingEnabled ? 'Disable website blocking' : 'Enable website blocking'}
            aria-label="Toggle website blocking"
          >
            <span className="toggle-knob" />
          </button>
        </div>

        {/* Blocker Error Banner */}
        {blockerError && (
          <div className="blocker-warning blocker-error-banner animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flex: 1 }}>
              <span>⚠️</span>
              <div>
                <strong>Website Blocking Error:</strong> {blockerError}
              </div>
            </div>
            <button onClick={clearBlockerError} className="btn-icon-subtle" title="Dismiss error">
              <IconX size={14} />
            </button>
          </div>
        )}

        {/* Admin Warning */}
        {adminWarning && websiteBlockingEnabled && !isSessionActive && !blockerError && (
          <div className="blocker-warning animate-fade-in">
            <span>⚠️</span>
            <span>{adminWarning}</span>
          </div>
        )}

        {/* Blocked Sites Preview (shown when enabled and idle) */}
        {websiteBlockingEnabled && !isSessionActive && !adminWarning && !blockerError && (
          <div className="blocked-sites-preview animate-fade-in">
            {DISPLAY_SITES.map((site) => (
              <span key={site} className="blocked-site-chip">
                🚫 {site}
              </span>
            ))}
          </div>
        )}

        {/* Circular Progress Ring */}
        <div className="timer-ring-container">
          <svg className="timer-ring-svg" viewBox="0 0 280 280">
            <circle
              className="ring-bg"
              cx="140"
              cy="140"
              r="120"
              strokeWidth="12"
            />
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
            {blockingActiveForSession && (
              <div className="blocking-active-badge animate-fade-in">
                <IconShield size={12} /> Blocking Active
              </div>
            )}
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
