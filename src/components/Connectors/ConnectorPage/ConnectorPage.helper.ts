import type { Dispatch, SetStateAction } from 'react';
import {
  type ConnectorSetting,
  type ConnectorSettings,
  type IDBWrapper,
  getConnectorSettings,
  updateConnectorSettings,
} from 'db/workspaceDb';
import { DICTIONARY } from 'dictionary';
import { type IConnector } from '../../ModelsSelector';

export const updateSettings = (
  db: IDBWrapper,
  setting: ConnectorSetting,
  savedSettings: ConnectorSetting[],
  setSavedSettings: Dispatch<SetStateAction<ConnectorSetting[]>>,
  connector: IConnector,
  send: (channel: string, ...args: any[]) => void
): void => {
  let newSettings: ConnectorSetting[] = [];
  const index = savedSettings.findIndex(
    (item) => item.SettingID === setting.SettingID
  );
  if (index !== -1) {
    newSettings = savedSettings.map((item) =>
      item.SettingID === setting.SettingID ? setting : item
    );
  } else {
    newSettings = [...savedSettings, setting];
  }
  setSavedSettings(newSettings);
  send('update-connector', connector, newSettings);
  updateConnectorSettings(db, connector.connectorFolder, newSettings).catch(
    (error) => {
      console.error(error);
    }
  );
};

export const readAndSetSavedSettings = (
  db: IDBWrapper,
  setSavedSettings: Dispatch<SetStateAction<ConnectorSetting[]>>,
  connectorFolder: string
): void => {
  getConnectorSettings(db, connectorFolder)
    .then((value: ConnectorSettings | undefined) => {
      if (value) {
        setSavedSettings(value.Settings);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const getConfimationText = (name: string): string =>
  DICTIONARY.questions.areYouWantToDeleteConnector.replace('<Name>', name);
