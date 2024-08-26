import React from 'react';
import { timeAgo } from 'utils';
import { type IConnector } from '../../../ModelsSelector';
import styles from './ConnectorCard.module.css';

interface ConnectorCardProps {
  connector: IConnector;
  setSelectedConnector: (value: IConnector) => void;
}

export const ConnectorCard = React.forwardRef<
  HTMLDivElement,
  ConnectorCardProps
>(({ connector, setSelectedConnector }: ConnectorCardProps, ref) => {
  const { connectorName, author, description, updated, tags } = connector;
  const tagsString = tags?.join(', ');

  return (
    <div
      ref={ref}
      className={styles.wrapper}
      onClick={() => {
        setSelectedConnector(connector);
      }}
    >
      <div className={styles.main}>
        <div className={styles.title}>{connectorName}</div>
        {author && <div className={styles.info}>{author}</div>}
        {updated && (
          <div className={styles.info}>{`Updated ${timeAgo(updated)}`}</div>
        )}
      </div>
      <div className={styles.description}>{description}</div>
      {tagsString && <div className={styles.tags}>{tagsString}</div>}
    </div>
  );
});

ConnectorCard.displayName = 'ConnectorCard';
