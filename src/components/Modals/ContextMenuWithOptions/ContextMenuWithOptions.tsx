import React, { type FunctionComponent, type SVGAttributes } from 'react';
import classnames from 'classnames';
import {
  ContextMenu,
  type AlignValues,
  type ClientRect,
} from '../ContextMenu/ContextMenu';
import styles from './ContextMenuWithOptions.module.css';

export interface ContextMenuOption {
  label: string;
  groupLabel?: string;
  icon?: FunctionComponent<SVGAttributes<SVGElement>>;
  onClick: (args: any) => any;
}

interface ContextMenuWithOptionsProps {
  optionGroups: ContextMenuOption[][];
  onClose: () => void;
  align?: AlignValues;
  triggerRef?: React.RefObject<HTMLElement>;
  ignoreElementRef?: React.RefObject<HTMLElement>;
  offset?: number;
  rect?: ClientRect;
  contextMenuClass?: string;
  placeholder?: string;
}

export const ContextMenuWithOptions: React.FC<ContextMenuWithOptionsProps> = ({
  optionGroups,
  onClose,
  align,
  triggerRef,
  ignoreElementRef,
  offset,
  rect,
  contextMenuClass,
  placeholder,
}) => {
  return (
    <ContextMenu
      onClose={onClose}
      align={align}
      triggerRef={triggerRef}
      ignoreElementRefs={ignoreElementRef && [ignoreElementRef]}
      offset={offset}
      rect={rect}
    >
      <div className={classnames(styles.wrapper, contextMenuClass)}>
        {!optionGroups.length && placeholder && (
          <div className={styles.group}>
            <div className={classnames(styles.menuItem, styles.placeholder)}>
              {placeholder}
            </div>
          </div>
        )}
        {optionGroups.map((options, ind) => {
          return (
            <div key={ind} className={styles.group}>
              {options[0].groupLabel && (
                <div className={styles.groupLabel}>{options[0].groupLabel}</div>
              )}
              {options.map((option, index) => {
                const Icon = option.icon;
                return (
                  <div
                    key={index}
                    className={styles.menuItem}
                    onClick={(e) => {
                      option.onClick(e);
                      onClose();
                    }}
                  >
                    {Icon && <Icon className={styles.menuItemIcon} />}
                    {option.label}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </ContextMenu>
  );
};
