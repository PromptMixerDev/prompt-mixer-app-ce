import { useEffect, useState } from 'react';

export enum ThemeMode {
  dark = 'dark',
  light = 'light',
}

export const useThemeMode = (): {
  theme: ThemeMode;
  setThemeMode: (value: ThemeMode) => void;
} => {
  const [theme, setTheme] = useState<ThemeMode>(ThemeMode.dark);

  const setMode = (mode: ThemeMode): void => {
    window.localStorage.setItem('theme', mode);
    setTheme(mode);
  };
  const setThemeMode = (value: ThemeMode): void => {
    setMode(value);
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem('theme') as ThemeMode;
    if (localTheme) {
      setTheme(localTheme);
    }
  }, []);

  return { theme, setThemeMode };
};
