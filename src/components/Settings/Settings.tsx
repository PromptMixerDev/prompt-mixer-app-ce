import React from 'react';
import { type ThemeMode } from 'hooks';
import { AppSettings } from './AppSettings';
import styles from './Settings.module.css';

interface SettingsProps {
  theme: ThemeMode;
  setThemeMode: (value: ThemeMode) => void;
}

export const Settings: React.FC<SettingsProps> = ({ setThemeMode, theme }) => (
  <div className={styles.wrapper}>
    <AppSettings onSelectTheme={setThemeMode} theme={theme} />
  </div>
);
