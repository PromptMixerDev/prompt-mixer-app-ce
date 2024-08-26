import React, { useEffect } from 'react';
import { ReactComponent as ErrorIcon } from 'assets/icons/error.svg';
import { ReactComponent as SuccessIcon } from 'assets/icons/success.svg';
import styles from './Notification.module.css';

export enum NotificationTypes {
  success = 'success',
  error = 'error',
}
interface NotificationProps {
  id: string;
  type: NotificationTypes;
  message: string;
  duration: number;
  onClose: (value: string) => void;
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  message,
  duration,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.wrapper}>
      {type === NotificationTypes.error ? (
        <ErrorIcon className={styles.error} />
      ) : (
        <SuccessIcon className={styles.success} />
      )}
      <div className={styles.content}>{message}</div>
    </div>
  );
};
