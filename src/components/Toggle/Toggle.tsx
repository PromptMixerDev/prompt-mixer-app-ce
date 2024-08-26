import React from 'react';
import styles from './Toggle.module.css';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

export const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle }) => {
  return (
    <div
      className={`${styles.toggle} ${isOn ? styles.on : ''}`}
      onClick={onToggle}
    >
      <div className={styles.toggleCircle}></div>
    </div>
  );
};
