import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useDensity } from '../../hooks/useDensity';
import { IconPalette, IconX, IconCheck, IconSparkles } from '../ui/Icons';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { activeThemeId, setTheme, presets } = useTheme();
  const { density, setDensity } = useDensity();

  if (!isOpen) return null;

  const artisticPresets = presets.filter((p) => p.category === 'artistic');
  const solidPresets = presets.filter((p) => p.category !== 'artistic');

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="glass-card theme-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-modal-header">
          <div className="header-title-box">
            <IconPalette size={22} className="theme-header-icon" />
            <div>
              <h3>Appearance & Design Themes</h3>
              <p className="theme-header-sub">
                Choose between artistic ambient wallpapers or clean developer color palettes.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-subtle" title="Close">
            <IconX size={20} />
          </button>
        </div>

        {/* Layout Density Mode Selection */}
        <div className="density-section">
          <h4 className="section-subtitle-bold">Layout Density Mode</h4>
          <div className="density-options-grid">
            <div
              className={`density-card ${density === 'calm' ? 'active' : ''}`}
              onClick={() => setDensity('calm')}
            >
              <div className="density-card-header">
                <span className="density-title">🌿 Calm Spacious (Default)</span>
                {density === 'calm' && <span className="active-theme-badge"><IconCheck size={12} /> Active</span>}
              </div>
              <p className="density-desc">Relaxed margins, comfortable action buttons, and spacious cards.</p>
            </div>

            <div
              className={`density-card ${density === 'compact' ? 'active' : ''}`}
              onClick={() => setDensity('compact')}
            >
              <div className="density-card-header">
                <span className="density-title">⚡ Sleek Compact</span>
                {density === 'compact' && <span className="active-theme-badge"><IconCheck size={12} /> Active</span>}
              </div>
              <p className="density-desc">Tighter padding, smaller button height, condensed metrics, and high info density.</p>
            </div>
          </div>
        </div>

        {/* Artistic Wallpaper Themes */}
        <div className="presets-section">
          <h4 className="section-subtitle-bold">🖼️ Artistic & Ambient Wallpapers</h4>
          <div className="artistic-presets-grid">
            {artisticPresets.map((preset) => {
              const isActive = preset.id === activeThemeId;
              return (
                <div
                  key={preset.id}
                  className={`artistic-preset-card ${isActive ? 'active' : ''}`}
                  onClick={() => setTheme(preset.id)}
                  style={{ backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.75)), url(${preset.bgImage})` }}
                >
                  <div className="artistic-card-top">
                    <span className="artistic-badge">Wallpaper</span>
                    {isActive && (
                      <span className="active-theme-badge">
                        <IconCheck size={12} /> Active
                      </span>
                    )}
                  </div>

                  <div className="artistic-info">
                    <h4 className="preset-name">{preset.name}</h4>
                    <p className="preset-desc">{preset.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Solid Color Presets */}
        <div className="presets-section">
          <h4 className="section-subtitle-bold">🎨 Developer Color Palettes</h4>
          <div className="theme-presets-grid">
            {solidPresets.map((preset) => {
              const isActive = preset.id === activeThemeId;
              return (
                <div
                  key={preset.id}
                  className={`theme-preset-card ${isActive ? 'active' : ''}`}
                  onClick={() => setTheme(preset.id)}
                >
                  <div className="preset-card-top">
                    <div className="swatch-preview">
                      <span
                        className="swatch-dot"
                        style={{ backgroundColor: preset.previewColors[0] }}
                        title="App Background"
                      />
                      <span
                        className="swatch-dot"
                        style={{ backgroundColor: preset.previewColors[1] }}
                        title="Card Background"
                      />
                      <span
                        className="swatch-dot"
                        style={{ backgroundColor: preset.previewColors[2] }}
                        title="Accent Color"
                      />
                    </div>

                    {isActive && (
                      <span className="active-theme-badge">
                        <IconCheck size={12} /> Active
                      </span>
                    )}
                  </div>

                  <div className="preset-info">
                    <h4 className="preset-name">{preset.name}</h4>
                    <p className="preset-desc">{preset.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
