import React from 'react';

export const StatsView: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Study Statistics</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Detailed focus metrics, daily/weekly/monthly breakdown, streaks, and session analytics.
        </p>
      </div>
    </div>
  );
};
