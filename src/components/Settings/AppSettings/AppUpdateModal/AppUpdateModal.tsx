import React from 'react';
import { useIpcRenderer } from 'hooks';
import { DICTIONARY } from 'dictionary';
import { ReactComponent as LogoIcon } from 'assets/icons/logo.svg';
import { Button, ButtonSize, ButtonTypes } from '../../../Button';
import styles from './AppUpdateModal.module.css';

interface AppUpdateModalProps {
  isAvaiable: boolean;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isAvaiable,
}) => {
  const { send } = useIpcRenderer();

  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>
        <LogoIcon />
      </div>
      <div className={styles.main}>
        {isAvaiable ? (
          <>
            <div className={styles.title}>
              {DICTIONARY.labels.updateAvaible}
            </div>
            <div className={styles.info}>
              {DICTIONARY.labels.newVersionReadyToInstall}
            </div>
          </>
        ) : (
          <div className={styles.title}>{DICTIONARY.labels.noUpdate}</div>
        )}
      </div>
      {isAvaiable && (
        <div className={styles.buttons}>
          <Button
            size={ButtonSize.m}
            type={ButtonTypes.text}
            onClick={() => send('install-update')}
            buttonClass={styles.button}
          >
            {DICTIONARY.labels.installNow}
          </Button>
          <Button
            size={ButtonSize.m}
            type={ButtonTypes.text}
            onClick={() => send('install-update-next-launch')}
            buttonClass={styles.button}
          >
            {DICTIONARY.labels.installNext}
          </Button>
        </div>
      )}
    </div>
  );
};
