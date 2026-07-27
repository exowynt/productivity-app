import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { IconPalette, IconX, IconCheck } from '../ui/Icons';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { activeThemeId, setTheme, presets } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="glass-card theme-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-modal-header">
          <div className="header-title-box">
            <IconPalette size={22} className="theme-header-icon" />
            <div>
              <h3>Choose Theme Preset</h3>
              <p className="theme-header-sub">
                Select from popular developer and productivity app color schemes.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon-subtle" title="Close">
            <IconX size={20} />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="theme-presets-grid">
          {presets.map((preset) => {
            const isActive = preset.id === activeThemeId;
            return (
              <div
                key={preset.id}
                className={`theme-preset-card ${isActive ? 'active' : ''}`}
                onClick={() => setTheme(preset.id)}
              >
                <div className="preset-card-top">
                  {/* Swatch preview circles */}
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
  );
};
