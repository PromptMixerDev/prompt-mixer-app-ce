import React from 'react';
import { ReactComponent as CloseIcon } from 'assets/icons/close.svg';
import { ReactComponent as SubtractIcon } from 'assets/icons/subtract.svg';
import { ReactComponent as ExpandLeftRightIcon } from 'assets/icons/expand-left-right.svg';
import { ReactComponent as SquareIcon } from 'assets/icons/square.svg';
import { useIpcRenderer } from 'hooks';
import { getOS, MAC_OS } from 'utils';
import styles from './ControlButtons.module.css';

export const ControlButtons: React.FC = (): JSX.Element => {
  const os = getOS();
  const { send } = useIpcRenderer();
  const macConfig = [
    { action: 'close-window', icon: CloseIcon, className: 'macClose' },
    { action: 'minimize-window', icon: SubtractIcon, className: 'macMin' },
    {
      action: 'maximize-window',
      icon: ExpandLeftRightIcon,
      className: 'macMax',
    },
  ];
  const winConfig = [
    { action: 'minimize-window', icon: SubtractIcon, className: '' },
    { action: 'maximize-window', icon: SquareIcon, className: '' },
    { action: 'close-window', icon: CloseIcon, className: '' },
  ];

  const config = os === MAC_OS ? macConfig : winConfig;

  return (
    <div
      className={`${styles.wrapper} ${os === MAC_OS ? styles.macControls : styles.winControls}`}
    >
      {config.map((button, index) => {
        const Icon = button.icon;
        return (
          <button
            key={index}
            className={`${os === MAC_OS ? styles.macButton : styles.winButton} ${styles[button.className]}`}
            onClick={() => send(button.action)}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
};
