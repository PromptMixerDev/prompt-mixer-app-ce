import React, { useEffect, useRef } from 'react';
import { ReactComponent as CloseIcon } from 'assets/icons/close.svg';
import styles from './Modal.module.css';
import { usePortal } from 'hooks';
import { Button, ButtonTypes } from 'components/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  isCloseButtonVisible?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  isCloseButtonVisible = true,
}): React.ReactElement | null => {
  const modalRef = useRef<HTMLDivElement>(null);
  const portal = usePortal();

  useEffect((): (() => void) => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return portal.render(
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => {
          e.stopPropagation();
        }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={modalRef}
      >
        {isCloseButtonVisible && (
          <Button
            onClick={onClose}
            type={ButtonTypes.icon}
            buttonClass={styles.closeButton}
          >
            <CloseIcon />
          </Button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
