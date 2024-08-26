/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';
import classnames from 'classnames';
import { Button, ButtonColor, type ButtonTypes } from '../../../Button';
import styles from './MainButton.module.css';

interface MainButtonProps {
  type?: ButtonTypes;
  disabled?: boolean;
  label: string;
  onClick?: (args: any) => any;
}

export const MainButton: React.FC<MainButtonProps> = ({
  type,
  disabled,
  label,
  onClick,
}): JSX.Element => {
  return (
    <Button
      type={type}
      color={!disabled ? ButtonColor.link : undefined}
      buttonClass={classnames(styles.button, !disabled && styles.activeButton)}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};
