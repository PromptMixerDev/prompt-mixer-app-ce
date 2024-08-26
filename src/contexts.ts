import { createContext } from 'react';
import { type IDBWrapper } from 'db/workspaceDb';
import { type IDBWrapper as CommonIDBWrapper } from 'db/commonDb';
import { type NotificationTypes } from 'components/NotificationProvider/Notification';

export const WorkspaceDatabaseContext = createContext<IDBWrapper | null>(null);
export const CommonDatabaseContext = createContext<CommonIDBWrapper | null>(
  null
);

interface NotificationsContextProps {
  addNotification: (
    type: NotificationTypes,
    message: string,
    duration?: number
  ) => void;
}

export const NotificationsContext = createContext<
  NotificationsContextProps | undefined
>(undefined);
