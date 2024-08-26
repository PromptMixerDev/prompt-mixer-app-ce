import React from 'react';
import { ReactComponent as LogoIcon } from 'assets/icons/logo.svg';
import styles from './Spinner.module.css';

export const Spinner: React.FC<{ height?: string }> = ({ height }) => {
  return (
    <div className={styles.spinner} style={{ height }}>
      <LogoIcon />
    </div>
  );
};
