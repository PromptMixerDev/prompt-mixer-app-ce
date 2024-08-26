import {
  useDrag,
  useDrop,
  type ConnectDragPreview,
  type ConnectDragSource,
  type ConnectDropTarget,
} from 'react-dnd';
import { type Model } from 'flexlayout-react';
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg';
import { ReactComponent as PencilIcon } from 'assets/icons/pencil.svg';
import { ReactComponent as DuplicateIcon } from 'assets/icons/duplicate.svg';
import { ReactComponent as ArrowRightUpIcon } from 'assets/icons/arrow-right-up.svg';
import { DICTIONARY } from 'dictionary';
import {
  type IDBWrapper,
  deletePromptChain,
  deleteChainCollection,
  duplicatePromptChain,
  type TreeItem,
  deleteDataset,
  deleteWorkflow,
  TreeEntityTypes,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import { updateTreeItem } from 'store/tree/treeSlice';
import {
  OUTPUTS_TAB_SET_ID,
  PROMPT_EDITOR_TAB_SET_ID,
  TabSetOrder,
  tabMap,
} from '../../FlexLayout/FlexLayout.config';
import {
  removeTabById,
  updateTabAttributes,
  type TabInfo,
} from '../../FlexLayout/FlexLayout.helper';
import { TREE_NODE_TYPE } from './TreeNode';
import { getTree, getUpdateEntityFunction } from '../Tree.helper';
import { type ContextMenuOption } from '../../Modals/ContextMenuWithOptions';
import { readAndSetDatasets } from '../../Dataset/Dataset.helper';
import { processChainDeletion } from '../../Workflow/WorkflowArea/WorkflowArea.helper';

export const renameConfirmHandler =
  (
    setIsRenaming: (value: boolean) => void,
    model: Model,
    dispatch: AppDispatch
  ) =>
  (
    db: IDBWrapper,
    id: string,
    name: string,
    entityType: TreeEntityTypes
  ): void => {
    setIsRenaming(false);
    const newName = name || DICTIONARY.labels.untitled;
    const update = getUpdateEntityFunction(entityType);
    update(db, id, { Title: newName })
      .then(() => {
        getTree(db, dispatch);
        if (
          [
            TreeEntityTypes.CHAIN,
            TreeEntityTypes.DATASET,
            TreeEntityTypes.WORKFLOW,
          ].includes(entityType)
        ) {
          updateTabAttributes(id, { name: newName }, model);
          dispatch(updateTreeItem({ id, label: newName }));
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

export const deleteConfirmHandler =
  (
    setShowConfirmModal: (value: boolean) => void,
    model: Model,
    dispatch: AppDispatch
  ) =>
  (db: IDBWrapper, id: string, entityType: TreeEntityTypes): void => {
    setShowConfirmModal(false);
    if (entityType === TreeEntityTypes.CHAIN) {
      deletePromptChain(db, id)
        .then(() => {
          getTree(db, dispatch);
          removeTabById(id, model);
          processChainDeletion(db, id, dispatch);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    if (entityType === TreeEntityTypes.COLLECTION) {
      deleteChainCollection(db, id)
        .then((chainIds: string[]) => {
          getTree(db, dispatch);
          chainIds.forEach((chainId) => removeTabById(chainId, model));
        })
        .catch((error) => {
          console.error(error);
        });
    }

    if (entityType === TreeEntityTypes.DATASET) {
      deleteDataset(db, id)
        .then(() => {
          getTree(db, dispatch);
          removeTabById(id, model);
          readAndSetDatasets(db, dispatch);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    if (entityType === TreeEntityTypes.WORKFLOW) {
      deleteWorkflow(db, id)
        .then(() => {
          getTree(db, dispatch);
          removeTabById(id, model);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

export const getConfimationText = (
  newName: string,
  entityType: TreeEntityTypes
): string => {
  switch (entityType) {
    case TreeEntityTypes.CHAIN:
      return DICTIONARY.questions.areYouWantToDeleteChain.replace(
        '<Name>',
        newName
      );
    case TreeEntityTypes.DATASET:
      return DICTIONARY.questions.areYouWantToDeleteDataset.replace(
        '<Name>',
        newName
      );
    case TreeEntityTypes.WORKFLOW:
      return DICTIONARY.questions.areYouWantToDeleteWorkflow.replace(
        '<Name>',
        newName
      );
    case TreeEntityTypes.COLLECTION:
    default:
      return DICTIONARY.questions.areYouWantToDeleteCollection.replace(
        '<Name>',
        newName
      );
  }
};

export const getContextMenuOptions = (
  setShowConfirmModal: (value: boolean) => void,
  setIsRenaming: (value: boolean) => void,
  entityType: TreeEntityTypes,
  handleDuplicateChain: () => void,
  handleMoveChain: () => void
): ContextMenuOption[][] => {
  const baseOptions = [
    {
      label: DICTIONARY.labels.rename,
      icon: PencilIcon,
      onClick: () => setIsRenaming(true),
    },
  ];
  if (entityType === TreeEntityTypes.CHAIN) {
    baseOptions.splice(
      1,
      0,
      {
        label: DICTIONARY.labels.duplicate,
        icon: DuplicateIcon,
        onClick: handleDuplicateChain,
      },
      {
        label: DICTIONARY.labels.moveTo,
        icon: ArrowRightUpIcon,
        onClick: handleMoveChain,
      }
    );
  }
  return [
    baseOptions,
    [
      {
        label: DICTIONARY.labels.delete,
        icon: DeleteIcon,
        onClick: () => setShowConfirmModal(true),
      },
    ],
  ];
};

export const getTabsInfo = (id: string, newName: string): TabInfo[] => {
  const chainTabNodeJson = {
    ...tabMap.promptChainTab,
    id,
    name: newName,
    config: { ...tabMap.promptChainTab.config, chainId: id },
  };

  return [
    {
      tabNodeJson: chainTabNodeJson,
      tabSetId: PROMPT_EDITOR_TAB_SET_ID,
      tabSetOrder: TabSetOrder.promptChain,
    },
    {
      tabNodeJson: tabMap.outputTab,
      tabSetId: OUTPUTS_TAB_SET_ID,
      tabSetOrder: TabSetOrder.outputs,
    },
  ];
};

export const getDatasetTabInfo = (id: string, newName: string): TabInfo[] => {
  const datasetTabNodeJson = {
    ...tabMap.datasetTab,
    id,
    name: newName,
    config: { ...tabMap.datasetTab.config, datasetId: id },
  };

  return [
    {
      tabNodeJson: datasetTabNodeJson,
      tabSetId: PROMPT_EDITOR_TAB_SET_ID,
      tabSetOrder: TabSetOrder.dataset,
    },
  ];
};

export const getWorkflowTabInfo = (id: string, newName: string): TabInfo[] => {
  const workflowTabNodeJson = {
    ...tabMap.workflowTab,
    id,
    name: newName,
    config: { ...tabMap.workflowTab.config, workflowId: id },
  };

  return [
    {
      tabNodeJson: workflowTabNodeJson,
      tabSetId: PROMPT_EDITOR_TAB_SET_ID,
      tabSetOrder: TabSetOrder.workflow,
    },
    {
      tabNodeJson: tabMap.outputTab,
      tabSetId: OUTPUTS_TAB_SET_ID,
      tabSetOrder: TabSetOrder.outputs,
    },
  ];
};
export interface DragProps {
  isDragging: boolean;
}

export const useTreeNodeDrag = (
  node: TreeItem
): [DragProps, ConnectDragSource, ConnectDragPreview] => {
  return useDrag(() => ({
    type: TREE_NODE_TYPE,
    item: node,
    canDrag: () =>
      [
        TreeEntityTypes.CHAIN,
        TreeEntityTypes.DATASET,
        TreeEntityTypes.WORKFLOW,
      ].includes(node.entityType),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
};

export interface DropProps {
  isOver: boolean;
  isCanDrop?: boolean;
}

export const useTreeNodeDrop = (
  node: TreeItem,
  handleDrop: (item: TreeItem, collectionId?: string) => void,
  timeoutIdRef: React.MutableRefObject<null | NodeJS.Timeout>,
  isExpanded: boolean,
  setIsExpanded: (value: boolean) => void
): [DropProps, ConnectDropTarget] => {
  const { id, entityType, collectionId } = node;
  const isCollection = entityType === TreeEntityTypes.COLLECTION;
  return useDrop(() => ({
    accept: TREE_NODE_TYPE,
    drop: (item: TreeItem) => {
      const newCollectionId = isCollection ? id : collectionId;
      handleDrop(item, newCollectionId);
    },
    canDrop: (item) => {
      if (
        (isCollection && item.collectionId !== id) ||
        (!isCollection && item.collectionId !== collectionId)
      ) {
        return true;
      }
      return false;
    },
    hover: () => {
      if (isCollection && !timeoutIdRef.current && !isExpanded) {
        const timerId = setTimeout(() => {
          setIsExpanded(true);
        }, 300);
        timeoutIdRef.current = timerId;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isCanDrop: monitor.canDrop(),
    }),
  }));
};

export const duplicateChainHandler = (
  db: IDBWrapper,
  id: string,
  dispatch: AppDispatch
): void => {
  duplicatePromptChain(db, id)
    .then(() => {
      getTree(db, dispatch);
    })
    .catch((error) => {
      console.error(error);
    });
};
