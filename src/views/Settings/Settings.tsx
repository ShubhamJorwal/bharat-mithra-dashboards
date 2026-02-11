import { useState } from 'react';
import {
  HiOutlineCog,
  HiOutlineColorSwatch,
  HiOutlineBell,
  HiOutlineGlobe,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineDesktopComputer,
  HiOutlineCheck,
  HiOutlineInformationCircle,
} from 'react-icons/hi';
import { useTheme, themeColors } from '../../context/ThemeContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PageHeader } from '../../components/common/PageHeader';
import './Settings.scss';

type ThemeKey = keyof typeof themeColors;

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  applicationUpdates: boolean;
  reportGenerated: boolean;
  staffActivity: boolean;
  systemAlerts: boolean;
}

interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastActive: boolean;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
}

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
];

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
];

const Settings = () => {
  const { theme: currentTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'system'>(currentTheme === 'darkMode' ? 'dark' : 'light');
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage('bm-language', 'en');
  const [notifSettings, setNotifSettings] = useLocalStorage<NotificationSettings>('bm-notification-settings', {
    emailNotifications: true, pushNotifications: true, applicationUpdates: true,
    reportGenerated: false, staffActivity: true, systemAlerts: true,
  });
  const [privacySettings, setPrivacySettings] = useLocalStorage<PrivacySettings>('bm-privacy-settings', {
    showOnlineStatus: true, showLastActive: true, twoFactorAuth: false, loginAlerts: true,
  });

  const tabs = [
    { id: 'appearance', icon: <HiOutlineColorSwatch />, label: 'Appearance' },
    { id: 'notifications', icon: <HiOutlineBell />, label: 'Notifications' },
    { id: 'language', icon: <HiOutlineGlobe />, label: 'Language & Region' },
    { id: 'privacy', icon: <HiOutlineShieldCheck />, label: 'Privacy & Security' },
    { id: 'account', icon: <HiOutlineUser />, label: 'Account' },
  ];

  const handleThemeSelect = (themeKey: ThemeKey) => {
    setTheme(themeKey);
    setColorMode(themeKey === 'darkMode' ? 'dark' : 'light');
  };

  const renderSwatch = (theme: { key: string; name: string; colors: string[] }) => {
    const isSelected = currentTheme === theme.key;
    return (
      <button key={theme.key} className={`set-swatch ${isSelected ? 'selected' : ''}`} onClick={() => handleThemeSelect(theme.key as ThemeKey)} title={theme.name}>
        <div className="set-swatch__circle" style={{ background: theme.colors.length > 1 ? `linear-gradient(135deg, ${theme.colors[0]} 50%, ${theme.colors[1]} 50%)` : theme.colors[0] }}>
          {isSelected && <HiOutlineCheck />}
        </div>
        <span className="set-swatch__label">{theme.name}</span>
      </button>
    );
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button className={`set-toggle ${checked ? 'active' : ''}`} onClick={() => onChange(!checked)}>
      <span className="set-toggle__knob" />
    </button>
  );

  return (
    <div className="set-page">
      <PageHeader icon={<HiOutlineCog />} title="Settings" description="Manage your preferences, appearance, and account settings" />

      <div className="set-layout">
        {/* Sidebar Tabs */}
        <div className="set-sidebar">
          {tabs.map(tab => (
            <button key={tab.id} className={`set-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="set-content">
          {/* Appearance */}
          {activeTab === 'appearance' && (
            <div className="set-panel">
              <div className="set-block">
                <h3>Color Mode</h3>
                <p className="set-block__desc">Choose if Bharat Mithra should use light or dark appearance</p>
                <div className="set-mode-selector">
                  <button className={`set-mode ${colorMode === 'light' ? 'active' : ''}`} onClick={() => { setColorMode('light'); if (currentTheme === 'darkMode') setTheme('confluence'); }}>
                    <HiOutlineSun /> <span>Light</span>
                  </button>
                  <button className={`set-mode ${colorMode === 'dark' ? 'active' : ''}`} onClick={() => { setColorMode('dark'); setTheme('darkMode'); }}>
                    <HiOutlineMoon /> <span>Dark</span>
                  </button>
                  <button className={`set-mode ${colorMode === 'system' ? 'active' : ''}`} onClick={() => setColorMode('system')}>
                    <HiOutlineDesktopComputer /> <span>System</span>
                  </button>
                </div>
              </div>

              <div className="set-block">
                <h3>Theme Colors</h3>
                <p className="set-block__desc">Choose a color theme for the application</p>
                <h4 className="set-block__sub">Solid Colors</h4>
                <div className="set-swatches">{singleColorThemes.map(renderSwatch)}</div>
                <h4 className="set-block__sub">Gradients</h4>
                <div className="set-swatches">{gradientThemes.map(renderSwatch)}</div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="set-panel">
              <div className="set-block">
                <h3>Notification Preferences</h3>
                <p className="set-block__desc">Control what notifications you receive</p>
                <div className="set-options">
                  <div className="set-option">
                    <div><span className="set-option__label">Email Notifications</span><span className="set-option__desc">Receive notifications via email</span></div>
                    <ToggleSwitch checked={notifSettings.emailNotifications} onChange={v => setNotifSettings({ ...notifSettings, emailNotifications: v })} />
                  </div>
                  <div className="set-option">
                    <div><span className="set-option__label">Push Notifications</span><span className="set-option__desc">Browser push notifications</span></div>
                    <ToggleSwitch checked={notifSettings.pushNotifications} onChange={v => setNotifSettings({ ...notifSettings, pushNotifications: v })} />
                  </div>
                  <div className="set-option">
                    <div><span className="set-option__label">Application Updates</span><span className="set-option__desc">Notify when application status changes</span></div>
                    <ToggleSwitch checked={notifSettings.applicationUpdates} onChange={v => setNotifSettings({ ...notifSettings, applicationUpdates: v })} />
                  </div>
                  <div className="set-option">
                    <div><span className="set-option__label">Report Generated</span><span className="set-option__desc">Notify when a report finishes generating</span></div>
                    <ToggleSwitch checked={notifSettings.reportGenerated} onChange={v => setNotifSettings({ ...notifSettings, reportGenerated: v })} />
                  </div>
                  <div className="set-option">
                    <div><span className="set-option__label">Staff Activity</span><span className="set-option__desc">Updates on staff member activities</span></div>
                    <ToggleSwitch checked={notifSettings.staffActivity} onChange={v => setNotifSettings({ ...notifSettings, staffActivity: v })} />
                  </div>
                  <div className="set-option">
                    <div><span className="set-option__label">System Alerts</span><span className="set-option__desc">Critical system and maintenance alerts</span></div>
                    <ToggleSwitch checked={notifSettings.systemAlerts} onChange={v => setNotifSettings({ ...notifSettings, systemAlerts: v })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Language */}
          {activeTab === 'language' && (
            <div className="set-panel">
              <div className="set-block">
                <h3>Language</h3>
                <p className="set-block__desc">Select your preferred language for the interface</p>
                <div className="set-lang-grid">
                  {languages.map(lang => (
                    <button key={lang.code} className={`set-lang ${selectedLanguage === lang.code ? 'active' : ''}`} onClick={() => setSelectedLanguage(lang.code)}>
                      <span className="set-lang__name">{lang.name}</span>
                      <span className="set-lang__native">{lang.native}</span>
                      {selectedLanguage === lang.code && <HiOutlineCheck className="set-lang__check" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="set-block">
                <h3>Region</h3>
                <p className="set-block__desc">Regional format preferences</p>
                <div className="set-region-grid">
                  <div className="set-region-item">
                    <span className="set-region-item__label">Date Format</span>
                    <select className="set-region-select" defaultValue="dd/mm/yyyy">
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="set-region-item">
                    <span className="set-region-item__label">Time Format</span>
                    <select className="set-region-select" defaultValue="12h">
                      <option value="12h">12-hour (AM/PM)</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                  <div className="set-region-item">
                    <span className="set-region-item__label">Currency</span>
                    <select className="set-region-select" defaultValue="inr">
                      <option value="inr">INR (₹)</option>
                      <option value="usd">USD ($)</option>
                    </select>
                  </div>
                  <div className="set-region-item">
                    <span className="set-region-item__label">Timezone</span>
                    <select className="set-region-select" defaultValue="ist">
                      <option value="ist">IST (UTC+5:30)</option>
                      <option value="utc">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeTab === 'privacy' && (
            <div className="set-panel">
              <div className="set-block">
                <h3>Privacy Settings</h3>
                <p className="set-block__desc">Control your visibility and data sharing preferences</p>
                <div className="set-options">
                  <div className="set-option">
                    <div><span className="set-option__label">Show Online Status</span><span className="set-option__desc">Let others see when you're online</span></div>
                    <ToggleSwitch checked={privacySettings.showOnlineStatus} onChange={v => setPrivacySettings({ ...privacySettings, showOnlineStatus: v })} />
                  </div>
                  <div className="set-option">
                    <div><span className="set-option__label">Show Last Active</span><span className="set-option__desc">Display your last active timestamp</span></div>
                    <ToggleSwitch checked={privacySettings.showLastActive} onChange={v => setPrivacySettings({ ...privacySettings, showLastActive: v })} />
                  </div>
                </div>
              </div>
              <div className="set-block">
                <h3>Security</h3>
                <p className="set-block__desc">Protect your account with additional security measures</p>
                <div className="set-options">
                  <div className="set-option">
                    <div><span className="set-option__label">Two-Factor Authentication</span><span className="set-option__desc">Add an extra layer of security</span></div>
                    <ToggleSwitch checked={privacySettings.twoFactorAuth} onChange={v => setPrivacySettings({ ...privacySettings, twoFactorAuth: v })} />
                  </div>
                  <div className="set-option">
                    <div><span className="set-option__label">Login Alerts</span><span className="set-option__desc">Get notified of new login attempts</span></div>
                    <ToggleSwitch checked={privacySettings.loginAlerts} onChange={v => setPrivacySettings({ ...privacySettings, loginAlerts: v })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account */}
          {activeTab === 'account' && (
            <div className="set-panel">
              <div className="set-block">
                <h3>Account Information</h3>
                <p className="set-block__desc">Your account details</p>
                <div className="set-account-card">
                  <div className="set-account-avatar">AD</div>
                  <div className="set-account-info">
                    <span className="set-account-name">Admin User</span>
                    <span className="set-account-email">admin@bharatmithra.gov.in</span>
                    <span className="set-account-role">Super Administrator</span>
                  </div>
                </div>
              </div>
              <div className="set-block">
                <h3>About</h3>
                <div className="set-about">
                  <div className="set-about__row"><span>Application</span><span>Bharat Mithra Dashboard</span></div>
                  <div className="set-about__row"><span>Version</span><span>2.0.0</span></div>
                  <div className="set-about__row"><span>Environment</span><span>Production</span></div>
                  <div className="set-about__row"><span>License</span><span>Government of India</span></div>
                </div>
              </div>
              <div className="set-block">
                <div className="set-info-banner">
                  <HiOutlineInformationCircle />
                  <span>For account changes such as password reset or role modification, please contact your system administrator.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
