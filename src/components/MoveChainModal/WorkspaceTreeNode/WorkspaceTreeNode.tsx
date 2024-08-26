/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useContext, useState } from 'react';
import classNames from 'classnames';
import { ReactComponent as ArrowRightIcon } from 'assets/icons/arrow-right.svg';
import { DEFAULT_DB } from 'db/workspaceDb';
import { useAppDispatch, useAppSelector, useLocalStorageState } from 'hooks';
import {
  CommonDatabaseContext,
  NotificationsContext,
  WorkspaceDatabaseContext,
} from 'contexts';
import { DICTIONARY } from 'dictionary';
import { type WorkspaceTreeItem } from '../MoveChainModal.helper';
import { Button, ButtonTypes } from '../../Button';
import { WorkspaceImage } from '../../Forms/CreateWorkspaceForm/WorkspaceImage';
import { ConfimationModal } from '../../Modals/ConfimationModal';
import { getConfimationText, moveChain } from './WorkspaceTreeNode.helper';
import { NotificationTypes } from '../../NotificationProvider/Notification';
import { getTree } from '../../Tree/Tree.helper';
import { removeTabById } from '../../FlexLayout/FlexLayout.helper';
import styles from './WorkspaceTreeNode.module.css';

interface NodeProps {
  node: WorkspaceTreeItem;
  chainName: string;
  chainId: string;
  setLoading: (value: boolean) => void;
  closeModal: () => void;
}

export const WorkspaceTreeNode: React.FC<NodeProps> = ({
  node,
  chainName,
  chainId,
  setLoading,
  closeModal,
}) => {
  const dispatch = useAppDispatch();
  const { model } = useAppSelector((store) => store.flexLayoutModel);
  const db = useContext(WorkspaceDatabaseContext)!;
  const commonDb = useContext(CommonDatabaseContext)!;
  const { addNotification } = useContext(NotificationsContext)!;
  const [activeWorkspaceId] = useLocalStorageState(
    'activeWorkspaceId',
    DEFAULT_DB as string
  );
  const { id, label, isWorkspace, isCollection, children, image, workspaceId } =
    node;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  const handleClick = (): void => {
    setShowConfirmModal(true);
  };

  const handleArrowClick = (): void => {
    setIsExpanded(!isExpanded);
  };

  const handleMoveChain = (): void => {
    setLoading(true);
    const destinationWorkspaceId = isWorkspace ? id : workspaceId;
    const collectionId = isCollection ? id : undefined;
    moveChain(
      db,
      commonDb,
      chainId,
      activeWorkspaceId,
      destinationWorkspaceId!,
      collectionId,
      dispatch
    )
      .then(() => {
        setLoading(false);
        addNotification(
          NotificationTypes.success,
          DICTIONARY.notifications.promptChainMovedSuccessfully
        );
        getTree(db, dispatch);
        removeTabById(chainId, model);
        closeModal();
      })
      .catch((error) => {
        console.error(error);
        addNotification(
          NotificationTypes.success,
          DICTIONARY.notifications.promptChainMovedSuccessfully
        );
      });
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.content} onClick={handleClick}>
          {isWorkspace && (
            <>
              <Button
                type={ButtonTypes.icon}
                buttonClass={styles.seatsButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleArrowClick();
                }}
              >
                <ArrowRightIcon
                  className={classNames(
                    styles.arrowIcon,
                    isExpanded && styles.expanded
                  )}
                />
              </Button>
              <div className={styles.workspace}>
                <WorkspaceImage
                  name={label}
                  imagePreview={image}
                  imageClass={styles.image}
                  imagePlaceholderClass={styles.imagePlaceholder}
                  isDefault={id === DEFAULT_DB}
                />
                <div className={styles.title}>{label}</div>
              </div>
            </>
          )}
          {isCollection && <div className={styles.title}>{label}</div>}
        </div>
        {isExpanded && !!children?.length && (
          <div className={styles.child}>
            {children.map((child: WorkspaceTreeItem) => (
              <WorkspaceTreeNode
                key={child.id}
                node={child}
                chainName={chainName}
                chainId={chainId}
                setLoading={setLoading}
                closeModal={closeModal}
              />
            ))}
          </div>
        )}
      </div>
      {showConfirmModal && (
        <ConfimationModal
          text={getConfimationText(chainName, label, isWorkspace)}
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleMoveChain}
        />
      )}
    </>
  );
};
