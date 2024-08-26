/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { TreeEntityTypes, type TreeItem } from 'db/workspaceDb';
import { useAppDispatch, useAppSelector } from 'hooks';
import { ReactComponent as ArrowRightIcon } from 'assets/icons/arrow-right.svg';
import { ReactComponent as FileTextIcon } from 'assets/icons/file-text.svg';
import { ReactComponent as DatasetIcon } from 'assets/icons/dataset-purple.svg';
import { ReactComponent as WorkflowIcon } from 'assets/icons/workflow.svg';
import { ReactComponent as MoreIcon } from 'assets/icons/more.svg';
import { WorkspaceDatabaseContext } from 'contexts';
import {
  deleteConfirmHandler,
  duplicateChainHandler,
  getConfimationText,
  getContextMenuOptions,
  getDatasetTabInfo,
  getTabsInfo,
  getWorkflowTabInfo,
  renameConfirmHandler,
  useTreeNodeDrag,
  useTreeNodeDrop,
} from './TreeNode.helper';
import { AlignValues } from '../../Modals/ContextMenu';
import { ContextMenuWithOptions } from '../../Modals/ContextMenuWithOptions';
import { ConfimationModal } from '../../Modals/ConfimationModal';
import { addNewTabsHandler } from '../../FlexLayout/FlexLayout.helper';
import { MoveChainModal } from '../../MoveChainModal/MoveChainModal';
import styles from './TreeNode.module.css';

const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';
export const TREE_NODE_TYPE = 'TREE_NODE';

interface NodeProps {
  node: TreeItem;
  handleDrop: (item: TreeItem, collectionId?: string) => void;
}

export const TreeNode: React.FC<NodeProps> = ({ node, handleDrop }) => {
  const dispatch = useAppDispatch();
  const { model } = useAppSelector((store) => store.flexLayoutModel);
  const { id, label, children, entityType } = node;
  const treeNodeRef = useRef(null);
  const timeoutIdRef = useRef<null | NodeJS.Timeout>(null);
  const db = useContext(WorkspaceDatabaseContext)!;
  const dotIconRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>(label);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isMoveChainModalOpen, setIsMoveChainModalOpen] =
    useState<boolean>(false);
  const handleRenameConfirm = renameConfirmHandler(
    setIsRenaming,
    model,
    dispatch
  );
  const handleDeleteConfirm = deleteConfirmHandler(
    setShowConfirmModal,
    model,
    dispatch
  );

  const handleClick = (): void => {
    if (isRenaming) return;
    switch (entityType) {
      case TreeEntityTypes.COLLECTION:
        setIsExpanded(!isExpanded);
        break;
      case TreeEntityTypes.CHAIN:
        addNewTabsHandler(getTabsInfo(id, newName), model, dispatch);
        break;
      case TreeEntityTypes.DATASET:
        addNewTabsHandler(getDatasetTabInfo(id, newName), model, dispatch);
        break;
      case TreeEntityTypes.WORKFLOW:
        addNewTabsHandler(getWorkflowTabInfo(id, newName), model, dispatch);
        break;
    }
  };

  const handleDotIconClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleNewNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNewName(event.target.value);
  };

  const handleRenameCancel = (): void => {
    setNewName(label);
    setIsRenaming(false);
  };

  const handleNewNameKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === ENTER_KEY) {
      handleRenameConfirm(db, id, newName, entityType);
    } else if (event.key === ESCAPE_KEY) {
      handleRenameCancel();
    }
  };

  const handleDuplicateChain = (): void => {
    duplicateChainHandler(db, id, dispatch);
  };

  const handleMoveChain = (): void => {
    setIsMoveChainModalOpen(true);
  };

  const [{ isDragging }, drag] = useTreeNodeDrag(node);
  const [{ isOver, isCanDrop }, drop] = useTreeNodeDrop(
    node,
    handleDrop,
    timeoutIdRef,
    isExpanded,
    setIsExpanded
  );

  useEffect(() => {
    setNewName(label);
  }, [label]);

  useEffect(() => {
    if (!isOver && timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, [isOver]);

  const isAllowDrop = isOver && isCanDrop;

  const content = isRenaming ? (
    <input
      className={styles.renameInput}
      type="text"
      value={newName}
      autoFocus
      onChange={handleNewNameChange}
      onKeyDown={handleNewNameKeyDown}
      onBlur={() => handleRenameConfirm(db, id, newName, entityType)}
    />
  ) : (
    newName
  );

  drag(drop(treeNodeRef));

  return (
    <div
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={classNames(
        entityType === TreeEntityTypes.CHAIN && styles.draggable,
        styles.wrapper
      )}
    >
      <div
        ref={treeNodeRef}
        className={classNames(
          styles.content,
          isRenaming && styles.renameContent,
          entityType === TreeEntityTypes.COLLECTION &&
            isAllowDrop &&
            styles.allowedDrop,
          entityType === TreeEntityTypes.CHAIN &&
            isAllowDrop &&
            styles.allowedDrop
        )}
        onClick={handleClick}
      >
        {entityType === TreeEntityTypes.COLLECTION && (
          <>
            <ArrowRightIcon
              className={classNames(
                styles.arrowIcon,
                isExpanded && styles.expanded
              )}
            />
            <div className={styles.title}>{content}</div>
          </>
        )}
        {entityType === TreeEntityTypes.CHAIN && (
          <>
            <FileTextIcon className={styles.folderIcon} />
            <div className={styles.title}>{content}</div>
          </>
        )}
        {entityType === TreeEntityTypes.DATASET && (
          <>
            <DatasetIcon className={styles.datasetIcon} />
            <div className={styles.title}>{content}</div>
          </>
        )}
        {entityType === TreeEntityTypes.WORKFLOW && (
          <>
            <WorkflowIcon className={styles.workflowIcon} />
            <div className={styles.title}>{content}</div>
          </>
        )}
        {!isRenaming && (
          <div
            ref={dotIconRef}
            className={styles.dotIcon}
            onClick={handleDotIconClick}
          >
            <MoreIcon />
          </div>
        )}
      </div>
      {showMenu && (
        <ContextMenuWithOptions
          optionGroups={getContextMenuOptions(
            setShowConfirmModal,
            setIsRenaming,
            entityType,
            handleDuplicateChain,
            handleMoveChain
          )}
          onClose={() => setShowMenu(false)}
          ignoreElementRef={dotIconRef}
          triggerRef={dotIconRef}
          align={AlignValues.UNDER_CENTER}
        />
      )}
      {showConfirmModal && (
        <ConfimationModal
          text={getConfimationText(newName, entityType)}
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => handleDeleteConfirm(db, id, entityType)}
        />
      )}
      {isExpanded && !!children?.length && (
        <div className={styles.child}>
          {children.map((child: TreeItem) => (
            <TreeNode key={child.id} node={child} handleDrop={handleDrop} />
          ))}
        </div>
      )}
      {isMoveChainModalOpen && (
        <MoveChainModal
          isOpen={isMoveChainModalOpen}
          closeModal={() => setIsMoveChainModalOpen(false)}
          chainName={newName}
          chainId={id}
        />
      )}
    </div>
  );
};
