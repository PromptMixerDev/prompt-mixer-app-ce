import React, { useState } from 'react';
import { ConnectorTabs } from './ConnectorTabs';
import { ConnectorCards } from './ConnectorCards';
import { type IConnector } from '../ModelsSelector';

export enum Tabs {
  all = 'all',
  installed = 'installed',
}

interface ConnectorsProps {
  tab?: Tabs;
}

export const Connectors: React.FC<ConnectorsProps> = ({ tab }) => {
  const [activeTab, setActiveTab] = useState<Tabs>(tab ?? Tabs.all);
  const [newConnectorOpened, setNewConnectorOpened] = useState<boolean>(false);
  const [selectedConnector, setSelectedConnector] = useState<IConnector | null>(
    null
  );
  return (
    <>
      <ConnectorTabs
        activeTab={activeTab}
        setNewConnectorOpened={setNewConnectorOpened}
        setActiveTab={setActiveTab}
        setSelectedConnector={setSelectedConnector}
      />
      <ConnectorCards
        activeTab={activeTab}
        newConnectorOpened={newConnectorOpened}
        setNewConnectorOpened={setNewConnectorOpened}
        selectedConnector={selectedConnector}
        setSelectedConnector={setSelectedConnector}
      />
    </>
  );
};
