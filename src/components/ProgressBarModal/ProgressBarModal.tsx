import React from 'react';
import styles from './ProgressBarModal.module.css';
import { type ProgressInfo } from 'electron-updater';
import { ReactComponent as LogoIcon } from 'assets/icons/logo.svg';
import { usePortal } from 'hooks';
import { DICTIONARY } from 'dictionary';

interface ProgressBarModalProps {
  progressInfo: ProgressInfo;
}

export const ProgressBarModal: React.FC<ProgressBarModalProps> = ({
  progressInfo,
}) => {
  const { render } = usePortal();
  const { percent } = progressInfo;

  return render(
    <div className={styles.wrapper}>
      <LogoIcon />
      <div className={styles.title}>{DICTIONARY.labels.downloadingUpdate}</div>
      <progress value={percent} max="100" className={styles.progressBar} />
    </div>
  );
};
