import React, { useState, useLayoutEffect } from 'react';
import { useOutsideClick, usePortal } from 'hooks';
import styles from './ContextMenu.module.css';

export enum AlignValues {
  RIGHT_CENTER = 'right-center',
  UNDER = 'under',
  UNDER_CENTER = 'under-center',
}

export interface ClientRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface ContextMenuProps {
  onClose: () => void;
  align?: AlignValues;
  triggerRef?: React.RefObject<HTMLElement>;
  ignoreElementRefs?: React.RefObject<HTMLElement>[];
  children: React.ReactNode;
  offset?: number;
  rect?: ClientRect;
}

const OFFSET = 10;

export const ContextMenu: React.FC<ContextMenuProps> = ({
  onClose,
  align = AlignValues.UNDER,
  triggerRef,
  ignoreElementRefs,
  children,
  offset = OFFSET,
  rect,
}) => {
  const { render } = usePortal();
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });
  const triggerRect = rect ?? triggerRef?.current?.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let style;

  if (triggerRect) {
    switch (align) {
      case AlignValues.RIGHT_CENTER:
        style = {
          top:
            triggerRect.top + height / 2 < windowHeight
              ? triggerRect.top - height / 2
              : windowHeight - (height + 10),
          left:
            triggerRect.left + width < windowWidth
              ? triggerRect.right + offset
              : triggerRect.left - offset - width,
        };
        break;
      case AlignValues.UNDER:
        style = {
          top:
            triggerRect.bottom + offset + height < windowHeight
              ? triggerRect.bottom + offset
              : triggerRect.top - (height + offset),
          left:
            triggerRect.left + width > windowWidth
              ? windowWidth - (width + 10)
              : triggerRect.left,
        };
        break;
      case AlignValues.UNDER_CENTER:
      default:
        style = {
          top:
            triggerRect.bottom + offset + height < windowHeight
              ? triggerRect.bottom + offset
              : triggerRect.top - (height + offset),
          left:
            triggerRect.left + width / 2 > windowWidth
              ? windowWidth - (width + 10)
              : triggerRect.left - width / 2,
        };
        break;
    }
  }
  const ref = useOutsideClick(onClose, { ignoreElementRefs });

  useLayoutEffect(() => {
    if (ref?.current) {
      const { offsetWidth, offsetHeight } = ref.current;
      setDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, [ref?.current, children]);

  return render(
    <div ref={ref} style={style} className={styles.wrapper}>
      {children}
    </div>
  );
};
