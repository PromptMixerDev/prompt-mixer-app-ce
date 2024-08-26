import React, { type FunctionComponent, type SVGAttributes } from 'react';
import {
  ContextMenu,
  type AlignValues,
  type ClientRect,
} from '../ContextMenu/ContextMenu';
import styles from './ContextMenuWithOptions.module.css';

export interface ContextMenuOption {
  label: string;
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
}

export const ContextMenuWithOptions: React.FC<ContextMenuWithOptionsProps> = ({
  optionGroups,
  onClose,
  align,
  triggerRef,
  ignoreElementRef,
  offset,
  rect,
}) => {
  return (
    <ContextMenu
      onClose={onClose}
      align={align}
      triggerRef={triggerRef}
      ignoreElementRef={ignoreElementRef}
      offset={offset}
      rect={rect}
    >
      <div className={styles.wrapper}>
        {optionGroups.map((options, ind) => {
          return (
            <div key={ind} className={styles.group}>
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
