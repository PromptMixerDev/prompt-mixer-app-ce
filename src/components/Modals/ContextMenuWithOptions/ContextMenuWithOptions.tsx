import React, {
  useEffect,
  useRef,
  useState,
  type FunctionComponent,
  type SVGAttributes,
} from 'react';
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
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number | null>(
    null
  );
  const menuRef = useRef<HTMLDivElement | null>(null);
  const flatOptions = optionGroups.flat();
  const totalOptions = flatOptions.length;

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (!totalOptions) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setFocusedOptionIndex((prevIndex) =>
          prevIndex === null || prevIndex === totalOptions - 1
            ? 0
            : prevIndex + 1
        );
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setFocusedOptionIndex((prevIndex) =>
          prevIndex === null || prevIndex === 0
            ? totalOptions - 1
            : prevIndex - 1
        );
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (focusedOptionIndex !== null) {
          flatOptions[focusedOptionIndex].onClick(null);
          onClose();
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        onClose();
        break;
      }
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [flatOptions, totalOptions]);

  useEffect(() => {
    if (focusedOptionIndex !== null && menuRef.current) {
      const focusedItem =
        menuRef.current.querySelectorAll('[data-menu-item]')[
          focusedOptionIndex
        ];
      if (focusedItem) {
        (focusedItem as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedOptionIndex]);

  return (
    <ContextMenu
      onClose={onClose}
      align={align}
      triggerRef={triggerRef}
      ignoreElementRefs={ignoreElementRef && [ignoreElementRef]}
      offset={offset}
      rect={rect}
    >
      <div
        ref={menuRef}
        className={classnames(styles.wrapper, contextMenuClass)}
      >
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
              {options[0]?.groupLabel && (
                <div className={styles.groupLabel}>{options[0].groupLabel}</div>
              )}
              {options.map((option, index) => {
                const IndexInFlatArray = flatOptions.indexOf(option);
                const isFocused = IndexInFlatArray === focusedOptionIndex;
                const Icon = option.icon;
                return (
                  <div
                    key={index}
                    data-menu-item
                    className={classnames(styles.menuItem, {
                      [styles.focused]: isFocused,
                    })}
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
