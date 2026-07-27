import React, { useState } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { Note } from '../../../shared/types';
import {
  IconNotes,
  IconPlus,
  IconPin,
  IconTrash,
  IconEdit,
  IconCheck,
} from '../../components/ui/Icons';

type NoteColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';

export const NotesView: React.FC = () => {
  const { data, addNote, updateNote, togglePinNote, deleteNote } = useStorage();
  const [isCreating, setIsCreating] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [titleInput, setTitleInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [selectedColor, setSelectedColor] = useState<NoteColor>('indigo');

  const notes = data.notes || [];
  const pinnedNotes = notes.filter((n) => n.pinned);
  const unpinnedNotes = notes.filter((n) => !n.pinned);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (contentInput.trim() || titleInput.trim()) {
      addNote(titleInput, contentInput, selectedColor);
      setTitleInput('');
      setContentInput('');
      setSelectedColor('indigo');
      setIsCreating(false);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setTitleInput(note.title);
    setContentInput(note.content);
    setSelectedColor(note.color || 'indigo');
  };

  const handleSaveEdit = (id: string) => {
    updateNote(id, {
      title: titleInput,
      content: contentInput,
      color: selectedColor,
    });
    setEditingNoteId(null);
    setTitleInput('');
    setContentInput('');
  };

  const colorOptions: { id: NoteColor; label: string; bg: string }[] = [
    { id: 'indigo', label: 'Indigo', bg: '#6366F1' },
    { id: 'emerald', label: 'Emerald', bg: '#10B981' },
    { id: 'amber', label: 'Amber', bg: '#F59E0B' },
    { id: 'rose', label: 'Rose', bg: '#F43F5E' },
    { id: 'violet', label: 'Violet', bg: '#8B5CF6' },
  ];

  const renderNoteCard = (note: Note) => {
    const isEditing = editingNoteId === note.id;

    if (isEditing) {
      return (
        <div key={note.id} className={`glass-card note-card note-card-edit color-${note.color || 'indigo'}`}>
          <input
            type="text"
            className="note-title-input"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Note Title"
          />
          <textarea
            className="note-content-textarea"
            rows={4}
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            placeholder="Note content..."
          />
          <div className="note-card-edit-footer">
            <div className="color-picker-row">
              {colorOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`color-dot ${selectedColor === c.id ? 'active' : ''}`}
                  style={{ backgroundColor: c.bg }}
                />
              ))}
            </div>
            <button onClick={() => handleSaveEdit(note.id)} className="btn btn-primary btn-sm">
              <IconCheck size={16} /> Save
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={note.id} className={`glass-card note-card color-${note.color || 'indigo'}`}>
        <div className="note-card-header">
          <h4 className="note-card-title">{note.title}</h4>
          <div className="note-card-actions">
            <button
              onClick={() => togglePinNote(note.id)}
              className={`btn-icon-subtle ${note.pinned ? 'pinned-active' : ''}`}
              title={note.pinned ? 'Unpin Note' : 'Pin Note'}
            >
              <IconPin size={16} />
            </button>
            <button onClick={() => handleStartEdit(note)} className="btn-icon-subtle" title="Edit Note">
              <IconEdit size={16} />
            </button>
            <button onClick={() => deleteNote(note.id)} className="btn-icon-danger" title="Delete Note">
              <IconTrash size={16} />
            </button>
          </div>
        </div>

        <p className="note-card-content">{note.content}</p>

        <div className="note-card-footer">
          <span className="note-date">
            {new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
          {note.pinned && <span className="pinned-badge">Pinned</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="notes-container animate-fade-in">
      {/* Top Header Card */}
      <div className="glass-card notes-header-card">
        <div className="notes-header-left">
          <div className="header-icon-box">
            <IconNotes size={24} />
          </div>
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.2rem' }}>Quick Notes & Scratchpad</h2>
            <p className="section-subtitle">Lightweight digital sticky notes for thoughts, reminders, and study snippets.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setTitleInput('');
            setContentInput('');
          }}
          className="btn btn-primary"
        >
          <IconPlus size={18} />
          <span>{isCreating ? 'Cancel' : 'New Note'}</span>
        </button>
      </div>

      {/* Note Creator Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="glass-card note-creator-card animate-fade-in">
          <h3 className="section-title" style={{ fontSize: '1rem' }}>Create Sticky Note</h3>
          <input
            type="text"
            className="note-title-input"
            placeholder="Note Title (e.g. Formulas, Exam Reminders, Book Quote)"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
          <textarea
            className="note-content-textarea"
            rows={4}
            placeholder="Write your note content here..."
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
          />
          <div className="creator-footer">
            <div className="color-picker-row">
              <span className="color-label">Color:</span>
              {colorOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`color-dot ${selectedColor === c.id ? 'active' : ''}`}
                  style={{ backgroundColor: c.bg }}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-primary">
              Create Note
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {notes.length === 0 && !isCreating && (
        <div className="glass-card empty-notes-card">
          <p className="empty-title">No notes created yet!</p>
          <p className="empty-sub">Click "New Note" above to pin scratchpad notes and reminders.</p>
        </div>
      )}

      {/* Pinned Notes Grid */}
      {pinnedNotes.length > 0 && (
        <div className="notes-section">
          <h3 className="section-subtitle-bold">📌 Pinned Notes ({pinnedNotes.length})</h3>
          <div className="notes-grid">{pinnedNotes.map(renderNoteCard)}</div>
        </div>
      )}

      {/* Other Notes Grid */}
      {unpinnedNotes.length > 0 && (
        <div className="notes-section">
          {pinnedNotes.length > 0 && <h3 className="section-subtitle-bold">All Notes ({unpinnedNotes.length})</h3>}
          <div className="notes-grid">{unpinnedNotes.map(renderNoteCard)}</div>
        </div>
      )}
    </div>
  );
};
