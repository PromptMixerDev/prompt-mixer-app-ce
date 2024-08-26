import React from 'react';
import styles from './SettingsOption.module.css';

interface SettingsOptionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsOption: React.FC<SettingsOptionProps> = ({
  title,
  children,
}) => {
  return (
    <div>
      <div className={styles.title}>{title}</div>
      {children}
    </div>
  );
};
