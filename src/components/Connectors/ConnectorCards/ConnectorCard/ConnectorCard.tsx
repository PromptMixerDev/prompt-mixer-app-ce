/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useState } from 'react';
import classNames from 'classnames';
import { timeAgo } from 'utils';
import { type IConnector } from '../../../ModelsSelector';
import styles from './ConnectorCard.module.css';
import { Button, ButtonColor, ButtonTypes } from 'components/Button';
import { ReactComponent as UpdateIcon } from 'assets/icons/update.svg';
import { DICTIONARY } from 'dictionary';
import { useIpcRenderer } from 'hooks';

interface ConnectorCardProps {
  connector: IConnector;
  setSelectedConnector: (value: IConnector) => void;
  isUpdateAvailable: boolean;
  installedVersion?: string;
  latestVersion?: string;
}

export const ConnectorCard = React.forwardRef<
  HTMLDivElement,
  ConnectorCardProps
>(
  (
    {
      connector,
      setSelectedConnector,
      isUpdateAvailable,
      installedVersion,
      latestVersion,
    }: ConnectorCardProps,
    ref
  ) => {
    const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] =
      useState<boolean>(false);
    const {
      connectorName,
      author,
      description,
      updated,
      tags,
      installedVersion: connectorInstalledVersion,
      latestVersion: connectorLatestVersion,
    } = connector;

    const tagsString = tags?.join(', ');
    const { send } = useIpcRenderer({
      'update-connector-version-finish': () => {
        setIsUpdateButtonDisabled(false);
      },
    });

    const installedVersionToDisplay =
      installedVersion ?? connectorInstalledVersion ?? undefined;
    const latestVersionToDisplay =
      latestVersion ?? connectorLatestVersion ?? undefined;

    const formatVersion = (value?: string): string =>
      value && value.trim() ? value : DICTIONARY.labels.unknown;

    const handleUpdateConnector = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsUpdateButtonDisabled(true);
      send(
        'update-connector-version',
        connector.connectorFolder,
        connector.link
      );
    };

    return (
      <div
        ref={ref}
        className={styles.wrapper}
        onClick={() => {
          setSelectedConnector(connector);
        }}
      >
        <div className={styles.main}>
          <div className={styles.connectorInfo}>
            <div className={styles.title}>{connectorName}</div>
            {author && <div className={styles.info}>{author}</div>}
            {updated && (
              <div className={styles.info}>{`Updated ${timeAgo(updated)}`}</div>
            )}
            {(installedVersionToDisplay || latestVersionToDisplay) && (
              <div className={styles.versionRow}>
                {installedVersionToDisplay && (
                  <div className={styles.versionItem}>
                    <span className={styles.versionLabel}>
                      {DICTIONARY.labels.installedVersion}
                    </span>
                    <span className={styles.versionValue}>
                      {formatVersion(installedVersionToDisplay)}
                    </span>
                  </div>
                )}
                {installedVersionToDisplay && latestVersionToDisplay && (
                  <span className={styles.versionSeparator}>•</span>
                )}
                {latestVersionToDisplay && (
                  <div className={styles.versionItem}>
                    <span className={styles.versionLabel}>
                      {DICTIONARY.labels.latestVersion}
                    </span>
                    <span className={styles.versionValue}>
                      {formatVersion(latestVersionToDisplay)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          {isUpdateAvailable && (
            <div className={styles.updateButton}>
              <Button
                buttonClass={styles.tabButton}
                buttonWrapperClass={styles.addButton}
                type={ButtonTypes.iconText}
                color={ButtonColor.success}
                disabled={isUpdateButtonDisabled}
                onClick={handleUpdateConnector}
              >
                <UpdateIcon
                  className={classNames(
                    isUpdateButtonDisabled && styles.rotateIcon
                  )}
                />
                <span>{DICTIONARY.labels.update}</span>
              </Button>
            </div>
          )}
        </div>
        <div className={styles.description}>{description}</div>
        {tagsString && <div className={styles.tags}>{tagsString}</div>}
      </div>
    );
  }
);

ConnectorCard.displayName = 'ConnectorCard';
