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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close modal on escape key
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
    // Apply custom color to CSS variables
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

  // Single color themes (like Slack)
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

  // Gradient themes
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

  // Classic themes
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
        className={`color-swatch ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          if (theme.key in themeColors) {
            handleThemeSelect(theme.key as ThemeKey);
          }
        }}
        title={theme.name}
      >
        <div
          className="swatch-color"
          style={{
            background: theme.colors.length > 1
              ? `linear-gradient(135deg, ${theme.colors[0]} 50%, ${theme.colors[1]} 50%)`
              : theme.colors[0]
          }}
        >
          {isSelected && <HiOutlineCheck className="check-icon" />}
        </div>
        <span className="swatch-name">{theme.name}</span>
      </button>
    );
  };

  return (
    <div className={`settings-wrapper ${position}`} ref={menuRef}>
      <button
        className="settings-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
      >
        <HiOutlineCog />
      </button>

      {/* Settings Dropdown Menu */}
      {isOpen && (
        <div className="settings-dropdown">
          <div className="dropdown-header">
            <span>Settings</span>
          </div>
          <div className="dropdown-items">
            <button
              className="dropdown-item"
              onClick={() => {
                setShowPreferences(true);
                setIsOpen(false);
              }}
            >
              <HiOutlineColorSwatch />
              <span>Preferences</span>
            </button>
            <button className="dropdown-item">
              <HiOutlineBell />
              <span>Notifications</span>
            </button>
            <button className="dropdown-item">
              <HiOutlineShieldCheck />
              <span>Privacy</span>
            </button>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="preferences-overlay" onClick={() => setShowPreferences(false)}>
          <div
            className="preferences-modal"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Preferences</h2>
              <button
                className="close-btn"
                onClick={() => setShowPreferences(false)}
              >
                <HiOutlineX />
              </button>
            </div>

            <div className="modal-content">
              {/* Sidebar */}
              <div className="preferences-sidebar">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Content */}
              <div className="preferences-main">
                {activeTab === 'appearance' && (
                  <div className="appearance-settings">
                    <div className="setting-section">
                      <h3>Color Mode</h3>
                      <p className="section-desc">
                        Choose if Bharat Mithra's appearance should be light or dark, or follow your computer's settings.
                      </p>
                      <div className="color-mode-options">
                        <button
                          className={`mode-btn ${colorMode === 'light' ? 'active' : ''}`}
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
                          className={`mode-btn ${colorMode === 'dark' ? 'active' : ''}`}
                          onClick={() => {
                            setColorMode('dark');
                            setTheme('darkMode');
                          }}
                        >
                          <HiOutlineMoon />
                          <span>Dark</span>
                        </button>
                        <button
                          className={`mode-btn ${colorMode === 'system' ? 'active' : ''}`}
                          onClick={() => setColorMode('system')}
                        >
                          <HiOutlineDesktopComputer />
                          <span>System</span>
                        </button>
                      </div>
                    </div>

                    <div className="setting-section">
                      <div className="themes-header">
                        <h3>Themes</h3>
                        <div className="theme-tabs">
                          <button className="tab-btn active">Preset themes</button>
                          <button className="tab-btn">Custom theme</button>
                        </div>
                      </div>

                      <div className="theme-category">
                        <h4>Single color</h4>
                        <div className="color-swatches">
                          {singleColorThemes.map(renderColorSwatch)}
                        </div>
                      </div>

                      <div className="theme-category">
                        <h4>Fun and new</h4>
                        <div className="color-swatches">
                          {gradientThemes.map(renderColorSwatch)}
                        </div>
                      </div>

                      <div className="theme-category">
                        <h4>Updated classics</h4>
                        <div className="color-swatches">
                          {classicThemes.map(renderColorSwatch)}
                        </div>
                      </div>
                    </div>

                    <div className="setting-section">
                      <h3>Custom Color</h3>
                      <p className="section-desc">Pick your own primary color</p>
                      <div className="custom-color-picker">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="color-input"
                        />
                        <input
                          type="text"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="color-text-input"
                          placeholder="#0052CC"
                        />
                        <button
                          className="apply-btn"
                          onClick={handleCustomColorApply}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="notifications-settings">
                    <h3>Notification Settings</h3>
                    <p className="section-desc">Manage your notification preferences</p>
                  </div>
                )}

                {activeTab === 'language' && (
                  <div className="language-settings">
                    <h3>Language & Region</h3>
                    <p className="section-desc">Set your language and regional preferences</p>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="privacy-settings">
                    <h3>Privacy & Security</h3>
                    <p className="section-desc">Manage your privacy and security settings</p>
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
