import React, { useContext, useState } from 'react';
import { DICTIONARY } from 'dictionary';
import { useAppSelector, useIpcRenderer } from 'hooks';
import { NotificationsContext } from 'contexts';
import { ReactComponent as BackIcon } from 'assets/icons/back.svg';
import { ConfimationModal } from '../../Modals/ConfimationModal';
import { Button, ButtonColor, ButtonTypes } from '../../Button';
import {
  type Setting,
  getSettings,
  getName,
  getLink,
  addConnector,
  getConfimationText,
} from './NewConnectorPage.helper';
import { ConnectorField } from '../ConnectorField';
import styles from './NewConnectorPage.module.css';

interface NewConnectorPageProps {
  setNewConnectorOpened: (value: boolean) => void;
}

export const NewConnectorPage: React.FC<NewConnectorPageProps> = ({
  setNewConnectorOpened,
}) => {
  const { installedConnectors } = useAppSelector((store) => store.connectors);
  const { addNotification } = useContext(NotificationsContext)!;
  const [settings, setSettings] = useState<Setting[]>(getSettings());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const name = getName(settings);
  const link = getLink(settings);
  const isButtonDisabled = !name || !link;

  const { send } = useIpcRenderer();

  const handleSettingsUpdate = (id: string, value: string): void => {
    setSettings((prev) =>
      prev.map((setting) => {
        if (setting.id === id) {
          return {
            ...setting,
            value,
          };
        } else {
          return setting;
        }
      })
    );
  };

  const handleAddConnector = (): void => {
    const isExists = installedConnectors.find(
      (connector) => connector.connectorFolder === name
    );
    if (isExists) {
      setShowConfirmModal(true);
    } else {
      addConnector(name!, link!, addNotification, send, setNewConnectorOpened);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Button
        type={ButtonTypes.iconText}
        onClick={() => {
          setNewConnectorOpened(false);
        }}
      >
        <BackIcon />
        <span>{DICTIONARY.labels.backToHome}</span>
      </Button>
      <div className={styles.title}>{DICTIONARY.labels.newConnector}</div>
      <div>
        <div>
          {settings.map((setting) => (
            <ConnectorField
              key={setting.id}
              id={setting.id}
              label={setting.label}
              onChange={handleSettingsUpdate}
            />
          ))}
        </div>
        <div className={styles.addButton}>
          <Button
            type={ButtonTypes.text}
            color={ButtonColor.link}
            onClick={handleAddConnector}
            disabled={isButtonDisabled}
          >
            {DICTIONARY.labels.addConnector}
          </Button>
        </div>
      </div>
      {showConfirmModal && (
        <ConfimationModal
          text={getConfimationText(name!)}
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() =>
            addConnector(
              name!,
              link!,
              addNotification,
              send,
              setNewConnectorOpened
            )
          }
        />
      )}
    </div>
  );
};
