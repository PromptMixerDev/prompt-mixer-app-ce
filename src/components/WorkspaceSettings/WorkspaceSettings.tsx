import React, { useContext, useEffect, useState } from 'react';
import {
  CommonDatabaseContext,
  NotificationsContext,
  WorkspaceDatabaseContext,
} from 'contexts';
import { useAppDispatch } from 'hooks';
import { DICTIONARY } from 'dictionary';
import {
  deleteWorkspace as deleteDBWorkspace,
  getWorkspace,
  Workspace,
} from 'db/commonDb';
import { DEFAULT_DB } from 'db/workspaceDb';
import { WorkspaceSettingsTabs } from './WorkspaceSettingsTabs';
import { Spinner } from '../Spinner';
import { Button, ButtonSize, ButtonTypes } from '../Button';
import { SettingsTab } from './SettingsTab';
import { NotificationTypes } from '../NotificationProvider/Notification';
import { resetLayout } from '../FlexLayout/FlexLayout.helper';
import styles from './WorkspaceSettings.module.css';

interface WorkspaceSettingsProps {
  workspaceId: string;
  setActiveWorkspaceId: (value: string) => void;
  resetWorkspaceDb: () => void;
}

export enum WorkspaceSettingsTab {
  settings = 'settings',
  billing = 'billing',
}

export const WorkspaceSettings: React.FC<WorkspaceSettingsProps> = ({
  workspaceId,
  setActiveWorkspaceId,
  resetWorkspaceDb,
}) => {
  const { addNotification } = useContext(NotificationsContext)!;
  const commonDb = useContext(CommonDatabaseContext)!;
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<WorkspaceSettingsTab>(
    WorkspaceSettingsTab.settings
  );
  const [deleteButtonDisable, setDeleteButtonDisable] =
    useState<boolean>(false);
  const [workspace, setWorkspace] = useState<Workspace | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    console.log(1);
    getWorkspace(commonDb, workspaceId)
      .then((workspace) => {
        console.log(2);
        setWorkspace(workspace);
        console.log(3);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(4);
        setIsLoading(false);
        setError(true);
        console.error(error);
      });
  }, []);

  const title =
    activeTab === WorkspaceSettingsTab.settings
      ? DICTIONARY.labels.settings
      : DICTIONARY.labels.billing;

  const handleDeleteWorkspace = async (): Promise<void> => {
    setDeleteButtonDisable(true);
    deleteDBWorkspace(commonDb, workspaceId)
      .then(async () => {
        resetWorkspaceDb();
        resetLayout(dispatch);
        setActiveWorkspaceId(DEFAULT_DB);
        addNotification(
          NotificationTypes.success,
          DICTIONARY.notifications.workspaceRemovedSuccessfully
        );
        setDeleteButtonDisable(false);
      })
      .catch((error) => {
        console.error(error);
        addNotification(
          NotificationTypes.error,
          DICTIONARY.notifications.failedRemoveWorkspace
        );
        setDeleteButtonDisable(false);
      });
    db.deleteDatabase().catch((error) => {
      console.error(error);
    });
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        {DICTIONARY.placeholders.failedLoadingWorkspaceInfo}
      </div>
    );
  }

  return (
    <>
      <WorkspaceSettingsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <Button
            type={ButtonTypes.text}
            size={ButtonSize.m}
            onClick={handleDeleteWorkspace}
            buttonClass={styles.removeButton}
            disabled={deleteButtonDisable}
          >
            {DICTIONARY.labels.remove}
          </Button>
        </div>
        {workspace && activeTab === WorkspaceSettingsTab.settings && (
          <SettingsTab workspaceId={workspaceId} name={workspace.Name} />
        )}
      </div>
    </>
  );
};
