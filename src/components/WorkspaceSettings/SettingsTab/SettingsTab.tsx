import React, { useContext, useState } from 'react';
import { DICTIONARY } from 'dictionary';
import { useAppSelector } from 'hooks';
import { CommonDatabaseContext, NotificationsContext } from 'contexts';
import { updateWorkspace } from 'db/commonDb';
import { InputField } from '../../Forms/FormElements/InputField';
import { NotificationTypes } from '../../NotificationProvider/Notification';
import { updateTabAttributes } from '../../FlexLayout/FlexLayout.helper';
import styles from './SettingsTab.module.css';

interface SettingsTabProps {
  name: string;
  workspaceId: string;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  name,
  workspaceId,
}) => {
  const db = useContext(CommonDatabaseContext)!;
  const { addNotification } = useContext(NotificationsContext)!;
  const { model } = useAppSelector((store) => store.flexLayoutModel);
  const [workspaceName, setWorkspaceName] = useState<string>(name);

  const handleBlur = async (): Promise<void> => {
    updateWorkspace(db, workspaceId, { Name: workspaceName })
      .then(() => {
        updateTabAttributes(workspaceId, { name: workspaceName }, model);
      })
      .catch((error) => {
        console.error(error);
        addNotification(
          NotificationTypes.error,
          DICTIONARY.notifications.failedRenameWorkspace
        );
      });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputWithLabel}>
        <label className={styles.label} htmlFor="workspaceName">
          {DICTIONARY.labels.workspaceName}
        </label>
        <InputField
          id="workspaceName"
          type="text"
          placeholder={DICTIONARY.placeholders.acmeInc}
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          onBlur={handleBlur}
          inputClass={styles.input}
        />
      </div>
    </div>
  );
};
