import { useState, useRef, useEffect } from 'react';
import {
  HiOutlineCog,
  HiOutlineColorSwatch,
  HiOutlineBell,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineDesktopComputer
} from 'react-icons/hi';
import { useTheme, themeColors } from '../../../context/ThemeContext';
import './Settings.scss';

type ThemeKey = keyof typeof themeColors;
type ColorMode = 'light' | 'dark' | 'system';

interface SettingsProps {
  position?: 'top-right' | 'bottom-left';
}

const Settings = ({ position = 'top-right' }: SettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [customColor, setCustomColor] = useState('#0052CC');
  const { theme: currentTheme, setTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowPreferences(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleThemeSelect = (themeKey: ThemeKey) => {
    setTheme(themeKey);
    if (themeKey === 'darkMode') {
      setColorMode('dark');
    } else {
      setColorMode('light');
    }
  };

  const handleCustomColorApply = () => {
    document.documentElement.style.setProperty('--color-primary', customColor);
    document.documentElement.style.setProperty('--color-accent', customColor);
    localStorage.setItem('customThemeColor', customColor);
  };

  const sidebarItems = [
    { id: 'notifications', icon: HiOutlineBell, label: 'Notifications' },
    { id: 'appearance', icon: HiOutlineColorSwatch, label: 'Appearance' },
    { id: 'language', icon: HiOutlineGlobe, label: 'Language & Region' },
    { id: 'privacy', icon: HiOutlineShieldCheck, label: 'Privacy & Security' },
  ];

  const singleColorThemes = [
    { key: 'confluence', name: 'Aubergine', colors: ['#0052CC'] },
    { key: 'slack', name: 'Clementine', colors: ['#4A154B'] },
    { key: 'sunset', name: 'Banana', colors: ['#FF6B35'] },
    { key: 'forest', name: 'Jade', colors: ['#2E7D32'] },
    { key: 'ocean', name: 'Lagoon', colors: ['#006064'] },
    { key: 'purple', name: 'Barbra', colors: ['#6B46C1'] },
    { key: 'gray', name: 'Gray', colors: ['#6B778C'] },
    { key: 'darkMode', name: 'Mood Indigo', colors: ['#1a1d21'] },
  ];

  const gradientThemes = [
    { key: 'raspberry', name: 'Raspberry Beret', colors: ['#E91E63', '#9C27B0'] },
    { key: 'business', name: 'Big Business', colors: ['#1565C0', '#0D47A1'] },
    { key: 'pog', name: 'POG', colors: ['#FFD54F', '#FFA726'] },
    { key: 'mintChip', name: 'Mint Chip', colors: ['#26A69A', '#00897B'] },
    { key: 'pbj', name: 'PB&J', colors: ['#8E24AA', '#D81B60'] },
    { key: 'chillVibes', name: 'Chill Vibes', colors: ['#43A047', '#1B5E20'] },
    { key: 'forestFloor', name: 'Forest Floor', colors: ['#5D4037', '#3E2723'] },
    { key: 'slackr', name: 'Slackr', colors: ['#7B1FA2', '#4A148C'] },
    { key: 'seaGlass', name: 'Sea Glass', colors: ['#80DEEA', '#4DD0E1'] },
    { key: 'lemonLime', name: 'Lemon Lime', colors: ['#CDDC39', '#8BC34A'] },
    { key: 'fallingLeaves', name: 'Falling Leaves', colors: ['#FF7043', '#BF360C'] },
    { key: 'sunrise', name: 'Sunrise', colors: ['#FFAB40', '#FF6D00'] },
  ];

  const classicThemes = [
    { key: 'chocoMint', name: 'Choco Mint', colors: ['#4DB6AC', '#00695C'] },
    { key: 'cmyk', name: 'CMYK', colors: ['#00BCD4', '#E91E63'] },
    { key: 'haberdashery', name: 'Haberdashery', colors: ['#8D6E63', '#5D4037'] },
    { key: 'hoth', name: 'Hoth', colors: ['#90CAF9', '#42A5F5'] },
    { key: 'ochin', name: 'Ochin', colors: ['#3F51B5', '#1A237E'] },
    { key: 'sweetTreat', name: 'Sweet Treat', colors: ['#F48FB1', '#EC407A'] },
  ];

  const renderColorSwatch = (theme: { key: string; name: string; colors: string[] }) => {
    const isSelected = currentTheme === theme.key ||
      (theme.colors.length === 1 && themeColors[currentTheme as ThemeKey]?.primary === theme.colors[0]);

    return (
      <button
        key={theme.key}
        className={`bm-swatch-item ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          if (theme.key in themeColors) {
            handleThemeSelect(theme.key as ThemeKey);
          }
        }}
        title={theme.name}
      >
        <div
          className="bm-swatch-circle"
          style={{
            background: theme.colors.length > 1
              ? `linear-gradient(135deg, ${theme.colors[0]} 50%, ${theme.colors[1]} 50%)`
              : theme.colors[0]
          }}
        >
          {isSelected && <HiOutlineCheck className="bm-check-mark" />}
        </div>
        <span className="bm-swatch-label">{theme.name}</span>
      </button>
    );
  };

  return (
    <div className={`bm-settings-container ${position}`} ref={menuRef}>
      <button
        className="bm-settings-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
      >
        <HiOutlineCog />
      </button>

      {isOpen && (
        <div className="bm-settings-menu">
          <div className="bm-menu-title">
            <span>Settings</span>
          </div>
          <div className="bm-menu-options">
            <button
              className="bm-menu-item"
              onClick={() => {
                setShowPreferences(true);
                setIsOpen(false);
              }}
            >
              <HiOutlineColorSwatch />
              <span>Preferences</span>
            </button>
            <button className="bm-menu-item">
              <HiOutlineBell />
              <span>Notifications</span>
            </button>
            <button className="bm-menu-item">
              <HiOutlineShieldCheck />
              <span>Privacy</span>
            </button>
          </div>
        </div>
      )}

      {showPreferences && (
        <div className="bm-prefs-backdrop" onClick={() => setShowPreferences(false)}>
          <div
            className="bm-prefs-dialog"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bm-dialog-header">
              <h2>Preferences</h2>
              <button
                className="bm-close-icon"
                onClick={() => setShowPreferences(false)}
              >
                <HiOutlineX />
              </button>
            </div>

            <div className="bm-dialog-body">
              <div className="bm-prefs-nav">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    className={`bm-nav-tab ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="bm-prefs-content">
                {activeTab === 'appearance' && (
                  <div className="bm-appearance-panel">
                    <div className="bm-setting-block">
                      <h3>Color Mode</h3>
                      <p className="bm-block-desc">
                        Choose if Bharat Mithra's appearance should be light or dark, or follow your computer's settings.
                      </p>
                      <div className="bm-mode-selector">
                        <button
                          className={`bm-mode-option ${colorMode === 'light' ? 'active' : ''}`}
                          onClick={() => {
                            setColorMode('light');
                            if (currentTheme === 'darkMode') {
                              setTheme('confluence');
                            }
                          }}
                        >
                          <HiOutlineSun />
                          <span>Light</span>
                        </button>
                        <button
                          className={`bm-mode-option ${colorMode === 'dark' ? 'active' : ''}`}
                          onClick={() => {
                            setColorMode('dark');
                            setTheme('darkMode');
                          }}
                        >
                          <HiOutlineMoon />
                          <span>Dark</span>
                        </button>
                        <button
                          className={`bm-mode-option ${colorMode === 'system' ? 'active' : ''}`}
                          onClick={() => setColorMode('system')}
                        >
                          <HiOutlineDesktopComputer />
                          <span>System</span>
                        </button>
                      </div>
                    </div>

                    <div className="bm-setting-block">
                      <div className="bm-themes-top">
                        <h3>Themes</h3>
                        <div className="bm-theme-toggle">
                          <button className="bm-toggle-btn active">Preset themes</button>
                          <button className="bm-toggle-btn">Custom theme</button>
                        </div>
                      </div>

                      <div className="bm-theme-section">
                        <h4>Single color</h4>
                        <div className="bm-swatches-grid">
                          {singleColorThemes.map(renderColorSwatch)}
                        </div>
                      </div>

                      <div className="bm-theme-section">
                        <h4>Fun and new</h4>
                        <div className="bm-swatches-grid">
                          {gradientThemes.map(renderColorSwatch)}
                        </div>
                      </div>

                      <div className="bm-theme-section">
                        <h4>Updated classics</h4>
                        <div className="bm-swatches-grid">
                          {classicThemes.map(renderColorSwatch)}
                        </div>
                      </div>
                    </div>

                    <div className="bm-setting-block">
                      <h3>Custom Color</h3>
                      <p className="bm-block-desc">Pick your own primary color</p>
                      <div className="bm-color-chooser">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="bm-color-picker"
                        />
                        <input
                          type="text"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="bm-color-hex"
                          placeholder="#0052CC"
                        />
                        <button
                          className="bm-apply-color"
                          onClick={handleCustomColorApply}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="bm-notifications-panel">
                    <h3>Notification Settings</h3>
                    <p className="bm-block-desc">Manage your notification preferences</p>
                  </div>
                )}

                {activeTab === 'language' && (
                  <div className="bm-language-panel">
                    <h3>Language & Region</h3>
                    <p className="bm-block-desc">Set your language and regional preferences</p>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="bm-privacy-panel">
                    <h3>Privacy & Security</h3>
                    <p className="bm-block-desc">Manage your privacy and security settings</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
