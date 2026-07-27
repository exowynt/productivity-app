import React from 'react';

export const TasksView: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Today's Tasks</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Lightweight checklist to organize and execute today's priorities.
        </p>
      </div>
    </div>
  );
};
