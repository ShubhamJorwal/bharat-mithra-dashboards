import { useState, useRef, useEffect } from 'react';
import { HiOutlineColorSwatch, HiCheck } from 'react-icons/hi';
import { useTheme, themeColors, type ThemeKey } from '../../../context/ThemeContext';
import './ThemeSwitcher.scss';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeSelect = (themeKey: ThemeKey) => {
    setTheme(themeKey);
    setIsOpen(false);
  };

  return (
    <div className="theme-switcher">
      <button
        ref={buttonRef}
        className="theme-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Theme"
      >
        <HiOutlineColorSwatch />
      </button>

      {isOpen && (
        <div ref={popupRef} className="theme-popup">
          <div className="theme-popup-header">
            <h3>Choose Theme</h3>
            <p>Select a color scheme for your dashboard</p>
          </div>
          <div className="theme-options">
            {(Object.keys(themeColors) as ThemeKey[]).map((key) => {
              const colorScheme = themeColors[key];
              const isActive = theme === key;

              return (
                <button
                  key={key}
                  className={`theme-option ${isActive ? 'active' : ''}`}
                  onClick={() => handleThemeSelect(key)}
                >
                  <div className="theme-preview">
                    <div
                      className="color-swatch primary"
                      style={{ backgroundColor: colorScheme.primary }}
                    />
                    <div
                      className="color-swatch secondary"
                      style={{ backgroundColor: colorScheme.secondary }}
                    />
                    <div
                      className="color-swatch accent"
                      style={{ backgroundColor: colorScheme.accent }}
                    />
                  </div>
                  <span className="theme-name">{colorScheme.name}</span>
                  {isActive && (
                    <span className="theme-check">
                      <HiCheck />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
