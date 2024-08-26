/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';
import classnames from 'classnames';
import { ReactComponent as ArrowDownIcon } from 'assets/icons/arrow-down.svg';
import styles from './Button.module.css';

export enum ButtonTypes {
  text = 'textType',
  icon = 'iconType',
  iconText = 'iconTextType',
}

export enum ButtonSize {
  s = 'small',
  m = 'medium',
}

export enum ButtonColor {
  link = 'link',
  success = 'success',
  danger = 'danger',
  transparent = 'transparent',
}
interface ButtonProps {
  id?: string;
  type?: ButtonTypes;
  size?: ButtonSize;
  color?: ButtonColor;
  onClick?: (args: any) => any;
  children: React.ReactNode;
  buttonClass?: string;
  buttonWrapperClass?: string;
  disabled?: boolean;
  splitted?: boolean;
}

export const Button = React.forwardRef<HTMLDivElement, ButtonProps>(
  (
    {
      id,
      type = ButtonTypes.text,
      size = ButtonSize.s,
      color = ButtonColor.transparent,
      onClick,
      children,
      buttonClass,
      buttonWrapperClass,
      disabled,
      splitted,
    }: ButtonProps,
    ref
  ) => {
    const buttonClasses = classnames(
      styles.button,
      styles[size],
      styles[type],
      styles[color],
      disabled && styles.disabled,
      buttonClass
    );

    return (
      <div
        className={classnames(
          styles.buttonWrapper,
          buttonWrapperClass,
          splitted && styles.splitted
        )}
        ref={ref}
      >
        <button
          id={id}
          className={buttonClasses}
          onClick={onClick}
          disabled={disabled}
        >
          {children}
        </button>
        {splitted && (
          <button
            className={buttonClasses}
            onClick={() => {}}
            disabled={disabled}
          >
            <ArrowDownIcon />
          </button>
        )}
      </div>
    );
  }
);

Button.displayName = 'Button';
