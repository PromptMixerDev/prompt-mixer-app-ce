import React, { useContext, useEffect, useState } from 'react';
import { DICTIONARY } from 'dictionary';
import { CommonDatabaseContext } from 'contexts';
import Modal from '../Modals/Modal/Modal';
import { SearchField } from '../SearchField';
import { Spinner } from '../Spinner';
import {
  type WorkspaceTreeItem,
  getWorkspaceTree,
  filterTree,
} from './MoveChainModal.helper';
import { WorkspaceTreeNode } from './WorkspaceTreeNode/WorkspaceTreeNode';
import styles from './MoveChainModal.module.css';

interface MoveChainModalProps {
  isOpen: boolean;
  closeModal: () => void;
  chainName: string;
  chainId: string;
}

export const MoveChainModal: React.FC<MoveChainModalProps> = ({
  isOpen,
  closeModal,
  chainName,
  chainId,
}) => {
  const commonDb = useContext(CommonDatabaseContext)!;
  const [isLoading, setLoading] = useState(false);
  const [workspaceTree, setWorkspaceTree] = useState<WorkspaceTreeItem[]>([]);
  const [filteredWorkspaceTree, setFilteredWorkspaceTree] = useState<
    WorkspaceTreeItem[]
  >([]);

  useEffect(() => {
    setLoading(true);
    getWorkspaceTree(commonDb)
      .then((tree) => {
        setWorkspaceTree(tree);
        setFilteredWorkspaceTree(tree);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  const handleSearch = (key: string): void => {
    setFilteredWorkspaceTree(filterTree(workspaceTree, key));
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} isCloseButtonVisible={false}>
      <div className={styles.wrapper}>
        <SearchField
          onSearch={handleSearch}
          searchFieldClass={styles.search}
          placeholder={DICTIONARY.labels.moveTo}
        />
        <div className={styles.content}>
          <div className={styles.title}>{DICTIONARY.labels.workspaces}</div>
          {isLoading && <Spinner />}
          {!isLoading &&
            filteredWorkspaceTree.map((node: WorkspaceTreeItem) => (
              <WorkspaceTreeNode
                key={node.id}
                node={node}
                chainName={chainName}
                chainId={chainId}
                setLoading={setLoading}
                closeModal={closeModal}
              />
            ))}
        </div>
      </div>
    </Modal>
  );
};
