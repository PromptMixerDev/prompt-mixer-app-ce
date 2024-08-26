import React from 'react';
import { type ConnectorSetting as IConnectorSetting } from 'db/workspaceDb';
import { type ConnectorParameter } from '../../../ModelsSelector';
import { ConnectorField } from '../../../Connectors/ConnectorField';

interface ConnectorSettingProps {
  setting: ConnectorParameter;
  savedSetting?: IConnectorSetting;
  updateSetting: (setting: IConnectorSetting) => void;
}

export const ConnectorSetting: React.FC<ConnectorSettingProps> = ({
  setting,
  savedSetting,
  updateSetting,
}) => {
  const handleBlur = (id: string, value: string): void => {
    updateSetting({
      SettingID: setting.id,
      Value: value,
      Type: setting.type,
      Name: setting.name,
    });
  };

  return (
    <ConnectorField
      id={setting.id}
      label={setting.name}
      fieldValue={savedSetting?.Value}
      onBlur={handleBlur}
    />
  );
};
