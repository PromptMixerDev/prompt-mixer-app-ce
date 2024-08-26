import React, { useContext } from 'react';
import { NotificationsContext } from 'contexts';
import { DICTIONARY } from 'dictionary';
import { useIpcRenderer } from 'hooks';
import { timeAgo } from 'utils';
import { ReactComponent as BackIcon } from 'assets/icons/back.svg';
import { Button, ButtonColor, ButtonSize, ButtonTypes } from '../../Button';
import { NotificationTypes } from '../../NotificationProvider/Notification';
import { type IConnector } from '../../ModelsSelector';
import styles from './InstallConnectorPage.module.css';

interface InstallConnectorPageProps {
  connector: IConnector;
  setSelectedConnector: (value: null) => void;
}

export const InstallConnectorPage: React.FC<InstallConnectorPageProps> = ({
  connector,
  setSelectedConnector,
}) => {
  const { addNotification } = useContext(NotificationsContext)!;
  const { send } = useIpcRenderer();

  const handleInstallConnector = (): void => {
    addNotification(
      NotificationTypes.success,
      DICTIONARY.notifications.installingConnector
    );
    send('install-connector', connector.connectorFolder, connector.link);
    setSelectedConnector(null);
  };

  return (
    <div className={styles.wrapper}>
      <Button
        type={ButtonTypes.iconText}
        onClick={() => {
          setSelectedConnector(null);
        }}
      >
        <BackIcon />
        <span>{DICTIONARY.labels.backToHome}</span>
      </Button>
      <div>
        <div className={styles.title}>{connector.connectorName}</div>
        <div className={styles.info}>
          {connector.author && <div>{connector.author}</div>}
          {connector.updated && (
            <div>{`Updated ${timeAgo(connector.updated)}`}</div>
          )}
        </div>
        <div className={styles.description}>{connector.description}</div>
      </div>
      <Button
        size={ButtonSize.m}
        type={ButtonTypes.text}
        color={ButtonColor.link}
        onClick={handleInstallConnector}
      >
        {DICTIONARY.labels.install}
      </Button>
    </div>
  );
};
