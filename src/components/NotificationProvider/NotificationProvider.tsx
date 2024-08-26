import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NotificationsContext } from 'contexts';
import { type NotificationTypes } from './Notification';
import {
  type INotification,
  Notifications,
} from './Notifications/Notifications';

const DURATION = 3000;

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const addNotification = (
    type: NotificationTypes,
    message: string,
    duration = DURATION
  ): void => {
    const id = uuidv4();
    setNotifications((prev) => [...prev, { id, type, message, duration }]);
  };

  return (
    <NotificationsContext.Provider value={{ addNotification }}>
      <Notifications
        notifications={notifications}
        setNotifications={setNotifications}
      />
      {children}
    </NotificationsContext.Provider>
  );
};
