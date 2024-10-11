import React from 'react';
import {
  ContextMenu,
  type AlignValues,
  type ClientRect,
} from '../ContextMenu/ContextMenu';
import { CheckboxOption } from '../../CheckboxOption';
import styles from './ContextMenuWithCheckboxes.module.css';

export interface ContextMenuWithCheckboxesOption {
  label: string;
  checked: boolean;
  onClick: (args: any) => any;
}

interface ContextMenuWithCheckboxesProps {
  options: ContextMenuWithCheckboxesOption[];
  onClose: () => void;
  align?: AlignValues;
  triggerRef?: React.RefObject<HTMLElement>;
  ignoreElementRef?: React.RefObject<HTMLElement>;
  offset?: number;
  rect?: ClientRect;
}

export const ContextMenuWithCheckboxes: React.FC<
  ContextMenuWithCheckboxesProps
> = ({
  options,
  onClose,
  align,
  triggerRef,
  ignoreElementRef,
  offset,
  rect,
}) => {
  const optionRefs = options.map(() =>
    React.useRef<HTMLDivElement | null>(null)
  );

  const ignoreElementRefs = [
    ...optionRefs,
    ...(ignoreElementRef ? [ignoreElementRef] : []),
  ];

  return (
    <ContextMenu
      onClose={onClose}
      align={align}
      triggerRef={triggerRef}
      ignoreElementRefs={ignoreElementRefs}
      offset={offset}
      rect={rect}
    >
      <div className={styles.wrapper}>
        {options.map((option, index) => {
          return (
            <div
              key={index}
              className={styles.menuItem}
              ref={optionRefs[index]}
            >
              <CheckboxOption
                checked={option.checked}
                onChange={option.onClick}
                label={option.label}
              />
            </div>
          );
        })}
      </div>
    </ContextMenu>
  );
};
