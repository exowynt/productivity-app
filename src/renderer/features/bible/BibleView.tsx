import React, { useState, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { getVerseOfTheDay, getRandomVerse, CURATED_VERSES, DailyVerse } from '../../utils/dailyInspiration';
import {
  IconBible,
  IconHeart,
  IconCheck,
  IconTrash,
  IconRefresh,
} from '../../components/ui/Icons';

export const BibleView: React.FC = () => {
  const { data, saveReflection, deleteReflection, toggleFavoriteVerse } = useStorage();
  const [verse, setVerse] = useState<DailyVerse>(() => getVerseOfTheDay());

  const todayStr = new Date().toISOString().split('T')[0];
  const reflections = data.reflections || [];
  const todayEntry = reflections.find((r) => r.date === todayStr);

  const [reflectionInput, setReflectionInput] = useState(todayEntry ? todayEntry.text : '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRefreshVerse = () => {
    setVerse((prev) => getRandomVerse(prev.id));
  };

  useEffect(() => {
    if (todayEntry) {
      setReflectionInput(todayEntry.text);
    }
  }, [todayEntry]);

  const favoriteVerseIds = data.favoriteVerses || [];
  const isVerseFavorited = favoriteVerseIds.includes(verse.id);

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (reflectionInput.trim()) {
      saveReflection(reflectionInput, verse.reference);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const favoritedVersesList = CURATED_VERSES.filter((v) => favoriteVerseIds.includes(v.id));

  return (
    <div className="bible-container animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card bible-header-card">
        <div className="bible-header-left">
          <div className="header-icon-box bible-icon-box">
            <IconBible size={24} />
          </div>
          <div>
            <h2 className="section-title">Quiet Reading & Scripture Reflection</h2>
            <p className="section-subtitle">
              A distraction-free space for daily reflection, Scripture meditation, and quiet thought.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Verse of the Day Card */}
      <div className="glass-card verse-spotlight-card">
        <div className="spotlight-top">
          <span className="badge badge-primary">Verse Spotlight</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleRefreshVerse}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.35rem' }}
              title="Get a new verse"
            >
              <IconRefresh size={14} /> New Verse
            </button>
            <button
              onClick={() => toggleFavoriteVerse(verse.id)}
              className={`btn-icon-subtle ${isVerseFavorited ? 'favorited' : ''}`}
              title={isVerseFavorited ? 'Remove from favorite verses' : 'Bookmark verse'}
            >
              <IconHeart size={18} fill={isVerseFavorited ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <blockquote className="spotlight-verse-text">"{verse.text}"</blockquote>
        
        <div className="spotlight-footer">
          <span className="spotlight-ref">— {verse.reference} ({verse.translation})</span>
        </div>
      </div>

      {/* Daily Reflection Journal */}
      <div className="glass-card journal-card">
        <div className="journal-header">
          <h3>Daily Reflection Journal</h3>
          <span className="journal-date-badge">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <form onSubmit={handleSaveReflection} className="journal-form">
          <textarea
            className="journal-textarea"
            rows={5}
            placeholder="Write your quiet thoughts, application notes, or prayers for today..."
            value={reflectionInput}
            onChange={(e) => setReflectionInput(e.target.value)}
          />

          <div className="journal-form-footer">
            {savedSuccess && (
              <span className="saved-toast animate-fade-in">
                <IconCheck size={14} /> Reflection saved successfully!
              </span>
            )}
            <button type="submit" className="btn btn-primary">
              <IconCheck size={18} />
              <span>Save Reflection</span>
            </button>
          </div>
        </form>
      </div>

      {/* Saved Reflections History Log */}
      {reflections.length > 0 && (
        <div className="glass-card reflections-history-card">
          <h3 className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Past Journal Reflections ({reflections.length})
          </h3>

          <div className="reflections-list">
            {reflections.map((entry) => (
              <div key={entry.id} className="reflection-item">
                <div className="reflection-item-header">
                  <span className="reflection-item-date">{entry.date}</span>
                  {entry.verseRef && <span className="reflection-verse-tag">{entry.verseRef}</span>}
                  <button
                    onClick={() => deleteReflection(entry.id)}
                    className="btn-icon-danger"
                    title="Delete Entry"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
                <p className="reflection-item-text">{entry.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Verses List */}
      {favoritedVersesList.length > 0 && (
        <div className="glass-card favorites-card">
          <h3 className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Bookmarked Scriptures ({favoritedVersesList.length})
          </h3>

          <div className="favorites-list">
            {favoritedVersesList.map((v) => (
              <div key={v.id} className="favorite-verse-item">
                <blockquote className="fav-verse-text">"{v.text}"</blockquote>
                <div className="fav-verse-footer">
                  <span className="fav-verse-ref">{v.reference}</span>
                  <button
                    onClick={() => toggleFavoriteVerse(v.id)}
                    className="btn-icon-danger"
                    title="Remove Bookmark"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
