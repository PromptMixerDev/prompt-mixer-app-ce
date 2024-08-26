import React from 'react';
import { useOutsideClick, usePortal } from 'hooks';
import { Button, ButtonTypes } from '../../Button';
import styles from './ConfimationModal.module.css';

interface ConfimationModalProps {
  text: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfimationModal: React.FC<ConfimationModalProps> = ({
  text,
  onClose,
  onConfirm,
}) => {
  const { render } = usePortal();

  const ref = useOutsideClick(onClose);
  return render(
    <div className={styles.modal} ref={ref}>
      <div className={styles.modalContent}>{text}</div>
      <div className={styles.modalControls}>
        <Button
          type={ButtonTypes.text}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Yes
        </Button>
        <Button type={ButtonTypes.text} onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
