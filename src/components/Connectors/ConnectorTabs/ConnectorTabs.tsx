/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React from 'react';
import classnames from 'classnames';
import { DICTIONARY } from 'dictionary';
import { ReactComponent as ListIcon } from 'assets/icons/list.svg';
import { ReactComponent as ShoppingIcon } from 'assets/icons/shopping.svg';
import { ReactComponent as AddIcon } from 'assets/icons/add.svg';
import { Button, ButtonColor, ButtonSize, ButtonTypes } from '../../Button';
import { Tabs } from '../Connectors';
import { type IConnector } from '../../ModelsSelector';
import styles from './ConnectorTabs.module.css';

interface ConnectorTabsProps {
  activeTab: string;
  setNewConnectorOpened: (value: boolean) => void;
  setActiveTab: (value: Tabs) => void;
  setSelectedConnector: (value: IConnector | null) => void;
}

export const ConnectorTabs: React.FC<ConnectorTabsProps> = ({
  activeTab,
  setNewConnectorOpened,
  setActiveTab,
  setSelectedConnector,
}) => {
  const handleTabClick = (tab: Tabs): void => {
    setActiveTab(tab);
    setSelectedConnector(null);
    setNewConnectorOpened(false);
  };

  return (
    <div className={styles.wrapper}>
      <Button
        buttonClass={classnames(
          styles.tabButton,
          activeTab !== Tabs.all && styles.inactive
        )}
        type={ButtonTypes.iconText}
        size={ButtonSize.m}
        onClick={() => handleTabClick(Tabs.all)}
      >
        <ShoppingIcon />
        <span>{DICTIONARY.labels.allConnectors}</span>
      </Button>
      <Button
        buttonClass={classnames(
          styles.tabButton,
          activeTab !== Tabs.installed && styles.inactive
        )}
        type={ButtonTypes.iconText}
        size={ButtonSize.m}
        onClick={() => handleTabClick(Tabs.installed)}
      >
        <ListIcon />
        <span>{DICTIONARY.labels.installed}</span>
      </Button>
      <Button
        buttonClass={styles.tabButton}
        buttonWrapperClass={styles.addButton}
        type={ButtonTypes.iconText}
        size={ButtonSize.m}
        color={ButtonColor.link}
        onClick={() => setNewConnectorOpened(true)}
      >
        <AddIcon />
        <span>{DICTIONARY.labels.addNew}</span>
      </Button>
    </div>
  );
};
