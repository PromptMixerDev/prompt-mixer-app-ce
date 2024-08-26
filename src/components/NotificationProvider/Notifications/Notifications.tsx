import React, { type Dispatch, type SetStateAction } from 'react';
import { usePortal } from 'hooks';
import { Notification, type NotificationTypes } from '../Notification';
import styles from './Notifications.module.css';

export interface INotification {
  id: string;
  type: NotificationTypes;
  message: string;
  duration: number;
}

interface NotificationsProps {
  notifications: INotification[];
  setNotifications: Dispatch<SetStateAction<INotification[]>>;
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  setNotifications,
}) => {
  const { render } = usePortal();

  const removeNotification = (id: string): void => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return render(
    <div className={styles.wrapper}>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};
