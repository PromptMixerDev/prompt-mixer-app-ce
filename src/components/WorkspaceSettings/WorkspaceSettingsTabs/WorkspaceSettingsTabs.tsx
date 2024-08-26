/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';
import classnames from 'classnames';
import { DICTIONARY } from 'dictionary';
import { Button, ButtonTypes } from '../../Button';
import { WorkspaceSettingsTab } from '../WorkspaceSettings';
import styles from './WorkspaceSettingsTabs.module.css';

interface WorkspaceSettingsTabsProps {
  activeTab: string;
  setActiveTab: (value: WorkspaceSettingsTab) => void;
}

export const WorkspaceSettingsTabs: React.FC<WorkspaceSettingsTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className={styles.wrapper}>
      <Button
        buttonClass={classnames(
          styles.tabButton,
          activeTab !== WorkspaceSettingsTab.settings && styles.inactive
        )}
        type={ButtonTypes.text}
        onClick={() => setActiveTab(WorkspaceSettingsTab.settings)}
      >
        <span>{DICTIONARY.labels.settings}</span>
      </Button>
      <Button
        buttonClass={classnames(
          styles.tabButton,
          activeTab !== WorkspaceSettingsTab.billing && styles.inactive
        )}
        type={ButtonTypes.text}
        onClick={() => setActiveTab(WorkspaceSettingsTab.billing)}
      >
        <span>{DICTIONARY.labels.billing}</span>
      </Button>
    </div>
  );
};
