import React from 'react';

export const BibleView: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bible & Daily Reflection</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Peaceful, distraction-free quiet reading view with verse of the day and reflection journal.
        </p>
      </div>
    </div>
  );
};
