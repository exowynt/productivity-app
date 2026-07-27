import React from 'react';

export const DashboardView: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome to your Morning Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          This view will serve as your primary launchpad every morning—showing your focus streak, today's focus time, daily verse, quote, quick notes preview, and today's priorities.
        </p>
      </div>
    </div>
  );
};
