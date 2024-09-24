import React, { useContext, useEffect, useState } from 'react';
import { WorkspaceDatabaseContext } from 'contexts';
import {
  removeChainModels,
  type ConnectorSetting as IConnectorSetting,
  removeConnectorSettings,
} from 'db/workspaceDb';
import { DICTIONARY } from 'dictionary';
import { useIpcRenderer } from 'hooks';
import { ReactComponent as BackIcon } from 'assets/icons/back.svg';
import { type IConnector } from '../../ModelsSelector';
import { Button, ButtonColor, ButtonTypes } from '../../Button';
import { ConnectorSetting } from './ConnectorSetting';
import {
  getConfimationText,
  readAndSetSavedSettings,
  updateSettings,
} from './ConnectorPage.helper';
import styles from './ConnectorPage.module.css';
import { ConfimationModal } from 'components/Modals/ConfimationModal';

interface ConnectorPageProps {
  connector: IConnector;
  setSelectedConnector: (value: null) => void;
}

export const ConnectorPage: React.FC<ConnectorPageProps> = ({
  connector,
  setSelectedConnector,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const [savedSettings, setSavedSettings] = useState<IConnectorSetting[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const { send } = useIpcRenderer();

  const handleSettingsUpdate = (setting: IConnectorSetting): void => {
    send('update-connector', connector, savedSettings);
    updateSettings(
      db,
      setting,
      savedSettings,
      setSavedSettings,
      connector.connectorFolder
    );
  };

  const handleRemoveConnector = (): void => {
    send('remove-connector', connector.connectorFolder);
    setSelectedConnector(null);
    removeChainModels(db, connector.connectorFolder).catch((error) => {
      console.error(error);
    });
    removeConnectorSettings(db, connector.connectorFolder).catch((error) => {
      console.error(error);
    });
  };

  useEffect(() => {
    readAndSetSavedSettings(db, setSavedSettings, connector.connectorFolder);
  }, []);

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
      <div className={styles.title}>{connector.connectorName}</div>
      <div>
        <div>
          {connector.settings.map((setting) => {
            const savedSetting = savedSettings.find(
              (item) => item.SettingID === setting.id
            );
            return (
              <ConnectorSetting
                key={setting.id}
                setting={setting}
                savedSetting={savedSetting}
                updateSetting={handleSettingsUpdate}
              />
            );
          })}
        </div>
        <div className={styles.removeZone}>
          <div className={styles.label}>{DICTIONARY.labels.dangerZone}</div>
          <Button
            id="remove-connector"
            type={ButtonTypes.text}
            color={ButtonColor.danger}
            onClick={() => setShowConfirmModal(true)}
          >
            {DICTIONARY.labels.removeConnector}
          </Button>
        </div>
      </div>
      {showConfirmModal && (
        <ConfimationModal
          text={getConfimationText(connector.connectorName)}
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => handleRemoveConnector()}
        />
      )}
    </div>
  );
};
