import React, { useState, useEffect } from 'react';
import { useStorage } from '../../hooks/useStorage';
import { getVerseOfTheDay, getRandomVerse, CURATED_VERSES, DailyVerse } from '../../utils/dailyInspiration';
import {
  IconBible,
  IconHeart,
  IconCheck,
  IconTrash,
  IconRefresh,
  IconBookOpen,
} from '../../components/ui/Icons';

export const BibleView: React.FC = () => {
  const { data, saveReflection, deleteReflection, toggleFavoriteVerse, addReadingLog, deleteReadingLog } = useStorage();
  const [verse, setVerse] = useState<DailyVerse>(() => getVerseOfTheDay());

  const todayStr = new Date().toISOString().split('T')[0];
  const reflections = data.reflections || [];
  const readingLogs = data.readingLogs || [];
  const todayEntry = reflections.find((r) => r.date === todayStr);

  const [reflectionInput, setReflectionInput] = useState(todayEntry ? todayEntry.text : '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Reading Tracker Form State
  const [readingPassage, setReadingPassage] = useState('');
  const [readingChapters, setReadingChapters] = useState(1);
  const [readingNotes, setReadingNotes] = useState('');
  const [readingLogSaved, setReadingLogSaved] = useState(false);

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

  const handleAddReadingLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readingPassage.trim()) return;
    await addReadingLog(readingPassage.trim(), readingNotes.trim(), Number(readingChapters) || 1);
    setReadingPassage('');
    setReadingChapters(1);
    setReadingNotes('');
    setReadingLogSaved(true);
    setTimeout(() => setReadingLogSaved(false), 3000);
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
            <h2 className="section-title">Scripture Reading Tracker & Reflection Journal</h2>
            <p className="section-subtitle">
              Document your daily Bible reading, track chapter progress, and reflect on God's Word.
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

      {/* Daily Bible Reading Tracker Card */}
      <div className="glass-card reading-tracker-card">
        <div className="journal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconBookOpen size={20} className="widget-icon" />
            <h3>Daily Scripture Reading Log</h3>
          </div>
          <span className="journal-date-badge">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <form onSubmit={handleAddReadingLog} className="reading-log-form">
          <div className="reading-form-row">
            <div className="form-group flex-2">
              <label className="form-label">Passage / Book Read</label>
              <input
                type="text"
                className="task-input"
                placeholder="e.g. Genesis 1-3, Psalm 23, Matthew 5"
                value={readingPassage}
                onChange={(e) => setReadingPassage(e.target.value)}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Chapters Count</label>
              <input
                type="number"
                min={1}
                max={150}
                className="task-input"
                value={readingChapters}
                onChange={(e) => setReadingChapters(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reading Notes & Small Reflection</label>
            <textarea
              className="journal-textarea"
              rows={3}
              placeholder="What did you learn or feel convicted by during today's reading?"
              value={readingNotes}
              onChange={(e) => setReadingNotes(e.target.value)}
            />
          </div>

          <div className="journal-form-footer">
            {readingLogSaved && (
              <span className="saved-toast animate-fade-in">
                <IconCheck size={14} /> Reading entry logged!
              </span>
            )}
            <button type="submit" className="btn btn-primary">
              <IconBookOpen size={18} />
              <span>Log Reading Entry</span>
            </button>
          </div>
        </form>

        {/* Reading History Log */}
        {readingLogs.length > 0 && (
          <div className="reading-history-section">
            <h4 className="section-subtitle-bold">Recent Reading Log History ({readingLogs.length})</h4>
            <div className="reading-history-list">
              {readingLogs.map((entry) => (
                <div key={entry.id} className="reading-history-item">
                  <div className="reading-item-header">
                    <div className="passage-badge-box">
                      <span className="reading-passage-title">{entry.passage}</span>
                      <span className="badge badge-primary">{entry.chaptersRead || 1} {entry.chaptersRead === 1 ? 'chapter' : 'chapters'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="reading-date">{entry.date}</span>
                      <button
                        onClick={() => deleteReadingLog(entry.id)}
                        className="btn-icon-danger"
                        title="Delete reading log"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </div>
                  {entry.reflection && <p className="reading-item-text">{entry.reflection}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Daily Reflection Journal */}
      <div className="glass-card journal-card">
        <div className="journal-header">
          <h3>Daily Reflection & Prayer Journal</h3>
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
