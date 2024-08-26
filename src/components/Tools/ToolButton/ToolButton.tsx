/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';
import { ReactComponent as FileAddIcon } from 'assets/icons/arrow-down.svg';
import { Button, ButtonTypes } from '../../Button';
import styles from './ToolButton.module.css';
import { usePortal } from 'hooks';
import classNames from 'classnames';

interface ToolButtonProps {
  onClick: () => void;
  buttonPosition: { top: number; left: number };
  collapsed: boolean;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  onClick,
  buttonPosition: { top, left },
  collapsed,
}) => {
  const { render } = usePortal();

  return render(
    <div className={styles.buttons} style={{ top, left }}>
      <Button type={ButtonTypes.icon} onClick={onClick}>
        <FileAddIcon
          className={classNames(styles.icon, collapsed && styles.collapsed)}
        />
      </Button>
    </div>
  );
};
