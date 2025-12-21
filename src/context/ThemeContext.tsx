import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Theme color schemes - inspired by Slack, Confluence, etc.
export const themeColors = {
  confluence: {
    name: 'Confluence',
    primary: '#0052CC',
    secondary: '#172B4D',
    accent: '#0065FF',
    background: '#FFFFFF',
    backgroundSecondary: '#F4F5F7',
    text: '#172B4D',
    textSecondary: '#6B778C',
    border: '#DFE1E6',
    success: '#36B37E',
    warning: '#FFAB00',
    danger: '#DE350B',
  },
  slack: {
    name: 'Slack',
    primary: '#4A154B',
    secondary: '#611f69',
    accent: '#36C5F0',
    background: '#FFFFFF',
    backgroundSecondary: '#F8F8F8',
    text: '#1D1C1D',
    textSecondary: '#616061',
    border: '#DDDDDD',
    success: '#2BAC76',
    warning: '#ECB22E',
    danger: '#E01E5A',
  },
  ocean: {
    name: 'Ocean Blue',
    primary: '#0077B6',
    secondary: '#023E8A',
    accent: '#00B4D8',
    background: '#FFFFFF',
    backgroundSecondary: '#F0F9FF',
    text: '#03045E',
    textSecondary: '#5C7A99',
    border: '#CAF0F8',
    success: '#06D6A0',
    warning: '#FFD166',
    danger: '#EF476F',
  },
  forest: {
    name: 'Forest Green',
    primary: '#2D6A4F',
    secondary: '#1B4332',
    accent: '#40916C',
    background: '#FFFFFF',
    backgroundSecondary: '#F0FDF4',
    text: '#1B4332',
    textSecondary: '#52796F',
    border: '#D8F3DC',
    success: '#40916C',
    warning: '#FFC300',
    danger: '#E63946',
  },
  sunset: {
    name: 'Sunset Orange',
    primary: '#E85D04',
    secondary: '#DC2F02',
    accent: '#F48C06',
    background: '#FFFFFF',
    backgroundSecondary: '#FFF8F0',
    text: '#370617',
    textSecondary: '#6C584C',
    border: '#FFE8D6',
    success: '#2D6A4F',
    warning: '#FFBA08',
    danger: '#D00000',
  },
  purple: {
    name: 'Royal Purple',
    primary: '#7209B7',
    secondary: '#560BAD',
    accent: '#B5179E',
    background: '#FFFFFF',
    backgroundSecondary: '#FAF5FF',
    text: '#240046',
    textSecondary: '#6B5B7A',
    border: '#E9D5FF',
    success: '#06D6A0',
    warning: '#FFD60A',
    danger: '#FF006E',
  },
  darkMode: {
    name: 'Dark Mode',
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA',
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
};

export type ThemeKey = keyof typeof themeColors;

interface ThemeContextType {
  theme: ThemeKey;
  colors: typeof themeColors.confluence;
  setTheme: (theme: ThemeKey) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as ThemeKey) || 'confluence';
  });

  const setTheme = (newTheme: ThemeKey) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const colors = themeColors[theme];
  const isDark = theme === 'darkMode';

  // Apply CSS variables to document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-background-secondary', colors.backgroundSecondary);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-danger', colors.danger);

    // Set body class for dark mode
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [colors, isDark]);

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
