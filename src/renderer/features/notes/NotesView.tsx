import React from 'react';

export const NotesView: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Quick Notes</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Digital sticky note wall with pinning, quick editing, and persistent auto-saving.
        </p>
      </div>
    </div>
  );
};
