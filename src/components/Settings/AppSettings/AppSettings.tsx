import React, { useEffect, useState } from 'react';
import { ThemeMode, useIpcRenderer } from 'hooks';
import { DICTIONARY } from 'dictionary';
import { SettingsOption } from '../SettingsOption';
import { CustomSelect } from '../../CustomSelect';
import { SettingsSubOption } from '../SettingsSubOption';
import { Button, ButtonColor, ButtonSize, ButtonTypes } from '../../Button';
import Modal from '../../Modals/Modal/Modal';
import { AppUpdateModal } from './AppUpdateModal';

interface AppSettingsProps {
  theme: ThemeMode;
  onSelectTheme: (value: ThemeMode) => void;
}

export const AppSettings: React.FC<AppSettingsProps> = ({
  onSelectTheme,
  theme,
}) => {
  const [appVersion, setAppVersion] = useState<string>('');
  const [selectedValue, setSelectedValue] = useState<ThemeMode>(theme);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);

  const handleSelect = (value: string): void => {
    setSelectedValue(value as ThemeMode);
    onSelectTheme(value as ThemeMode);
  };

  const options = [
    { label: DICTIONARY.labels.light, value: ThemeMode.light },
    { label: DICTIONARY.labels.dark, value: ThemeMode.dark },
  ];

  const selectedOption = options.find((op) => op.value === selectedValue);
  const selectId = 'select' + DICTIONARY.settingsOptions.appearance;

  const { send } = useIpcRenderer({
    'app-version': (value: string) => {
      setAppVersion(value);
    },
    'update-available': () => {
      setIsUpdateAvailable(true);
      setUpdateModalOpen(true);
    },
    'update-not-available': () => {
      setIsUpdateAvailable(false);
      setUpdateModalOpen(true);
    },
  });

  useEffect(() => {
    send('get-app-version');
  }, []);

  return (
    <>
      <SettingsOption title={DICTIONARY.settingsOptions.appSettings}>
        <SettingsSubOption
          title={DICTIONARY.settingsOptions.appearance}
          description={DICTIONARY.settingsOptions.chooseTheme}
        >
          <CustomSelect
            id={selectId}
            selectedOption={selectedOption}
            options={options}
            onChange={handleSelect}
          />
        </SettingsSubOption>
        <SettingsSubOption title={`Version ${appVersion}`}>
          <Button
            size={ButtonSize.m}
            type={ButtonTypes.text}
            color={ButtonColor.link}
            onClick={() => send('check-for-updates')}
          >
            {DICTIONARY.labels.checkForUpgrade}
          </Button>
        </SettingsSubOption>
      </SettingsOption>
      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        isCloseButtonVisible={false}
      >
        <AppUpdateModal isAvaiable={isUpdateAvailable} />
      </Modal>
    </>
  );
};
