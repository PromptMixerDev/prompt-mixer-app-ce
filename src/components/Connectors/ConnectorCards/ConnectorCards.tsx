import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DICTIONARY } from 'dictionary';
import { useAppSelector, useAsync } from 'hooks';
import {
  type ConnectorsResponse,
  getConnectors,
  getConnectorsByIds,
  PromptMixerConnector,
} from 'http/connectors';
import { ConnectorCard } from './ConnectorCard/ConnectorCard';
import { type IConnector } from '../../ModelsSelector';
import { ConnectorPage } from '../ConnectorPage';
import { NewConnectorPage } from '../NewConnectorPage';
import { Tabs } from '../Connectors';
import { Spinner } from '../../Spinner';
import { SearchField } from '../../SearchField';
import { mapToConnectors } from './ConnectorCards.helper';
import { InstallConnectorPage } from '../InstallConnectorPage';
import styles from './ConnectorCards.module.css';

interface ConnectorCardsProps {
  activeTab: Tabs;
  newConnectorOpened: boolean;
  setNewConnectorOpened: (value: boolean) => void;
  selectedConnector: IConnector | null;
  setSelectedConnector: (value: IConnector | null) => void;
}

const PAGE_LIMIT = 10;

export const ConnectorCards: React.FC<ConnectorCardsProps> = ({
  activeTab,
  newConnectorOpened,
  setNewConnectorOpened,
  selectedConnector,
  setSelectedConnector,
}) => {
  const { installedConnectors } = useAppSelector((store) => store.connectors);
  const installedConnector =
    selectedConnector &&
    installedConnectors.find(
      (el) => el.connectorFolder === selectedConnector.connectorFolder
    );

  const [page, setPage] = useState<number>(1);
  const [searchKey, setSearchKey] = useState('');
  const [loadedConnectors, setLoadedConnectors] = useState<IConnector[]>([]);
  const { data, isLoading, error } = useAsync<
    ConnectorsResponse,
    [number, number, string]
  >(getConnectors, page, PAGE_LIMIT, searchKey);

  const { data: originInstoledConnectors } = useAsync<
    PromptMixerConnector[],
    string[][]
  >(
    getConnectorsByIds,
    installedConnectors.map((el) => el.connectorFolder)
  );

  const hasMore = data?.total_connectors
    ? page * PAGE_LIMIT < data.total_connectors
    : false;

  const observer = useRef<IntersectionObserver | null>(null);
  const lastConnectorElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const handleSearch = (key: string): void => {
    setSearchKey(key);
    setPage(1);
    setLoadedConnectors([]);
  };

  const title =
    activeTab === Tabs.all
      ? DICTIONARY.labels.allConnectors
      : DICTIONARY.labels.installed;

  if (error && activeTab === Tabs.all) {
    return (
      <div className={styles.error}>
        {DICTIONARY.placeholders.failedLoadingConnectors}
      </div>
    );
  }

  useEffect(() => {
    if (data?.connectors) {
      const connectors = mapToConnectors(data.connectors);
      setLoadedConnectors((prev) => [...prev, ...connectors]);
    }
  }, [data]);

  return (
    <div className={styles.wrapper}>
      {!selectedConnector && !newConnectorOpened && (
        <>
          <div className={styles.title}>{title}</div>
          {activeTab === Tabs.all && (
            <>
              <SearchField
                onSearch={handleSearch}
                searchFieldClass={styles.search}
              />
              <div className={styles.cardsWrapper}>
                {loadedConnectors.map((connector, index) => {
                  const installedConnector = installedConnectors.find(
                    (el) => el.connectorFolder === connector.connectorFolder
                  );
                  return (
                    <ConnectorCard
                      ref={
                        loadedConnectors.length === index + 1
                          ? lastConnectorElementRef
                          : undefined
                      }
                      key={connector.connectorFolder}
                      connector={connector}
                      setSelectedConnector={setSelectedConnector}
                      isUpdateAvailable={
                        !!(
                          installedConnector &&
                          connector.connectorVersion !==
                            installedConnector.connectorVersion
                        )
                      }
                    />
                  );
                })}
              </div>
              {isLoading && activeTab === Tabs.all && <Spinner />}
            </>
          )}
          {activeTab === Tabs.installed && (
            <div className={styles.cardsWrapper}>
              {mapToConnectors(originInstoledConnectors).map((connector) => {
                const installedConnector = installedConnectors.find(
                  (el) => el.connectorFolder === connector.connectorFolder
                );

                return (
                  <ConnectorCard
                    key={connector.connectorFolder}
                    connector={connector}
                    setSelectedConnector={setSelectedConnector}
                    isUpdateAvailable={
                      connector.connectorVersion !==
                      installedConnector?.connectorVersion
                    }
                  />
                );
              })}
            </div>
          )}
        </>
      )}
      {selectedConnector && installedConnector && !newConnectorOpened && (
        <ConnectorPage
          connector={installedConnector}
          setSelectedConnector={setSelectedConnector}
        />
      )}
      {selectedConnector && !installedConnector && !newConnectorOpened && (
        <InstallConnectorPage
          connector={selectedConnector}
          setSelectedConnector={setSelectedConnector}
        />
      )}
      {newConnectorOpened && (
        <NewConnectorPage setNewConnectorOpened={setNewConnectorOpened} />
      )}
    </div>
  );
};
