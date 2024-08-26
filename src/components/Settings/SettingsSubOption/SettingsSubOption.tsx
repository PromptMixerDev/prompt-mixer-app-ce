import React from 'react';
import styles from './SettingsSubOption.module.css';
import { generateIdFromString } from '../../../utils';

interface SettingsSubOptionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsSubOption: React.FC<SettingsSubOptionProps> = ({
  title,
  description,
  children,
}) => {
  const id = generateIdFromString(title);

  return (
    <div className={styles.wrapper} id={id}>
      <div className={styles.row}>
        <div>
          <div className={styles.label}>{title}</div>
          {description && (
            <div className={styles.description}>{description}</div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
