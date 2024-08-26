import { v4 as uuidv4 } from 'uuid';
import { type Model } from 'flexlayout-react';
import { type ConnectDropTarget, useDrop } from 'react-dnd';
import {
  type IDBWrapper,
  updatePromptChain,
  getTreeData,
  type TreeItem,
  updateDataset,
  deleteAllChainsAndCollections,
  createNewCollection,
  updateWorkflow,
  TreeEntityTypes,
  type Workflow,
  type Dataset,
  type PromptChain,
  updateChainCollection,
  type ChainCollection,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import { setTreeData, setTreeLoading } from 'store/tree/treeSlice';
import { TREE_NODE_TYPE } from './TreeNode';
import {
  addNewTabsHandler,
  removeTabsetById,
} from '../FlexLayout/FlexLayout.helper';
import {
  OUTPUTS_TAB_SET_ID,
  PROMPT_EDITOR_TAB_SET_ID,
  TabSetOrder,
  tabMap,
} from '../FlexLayout/FlexLayout.config';

export const getTree = (db: IDBWrapper, dispatch: AppDispatch): void => {
  dispatch(setTreeLoading(true));
  getTreeData(db)
    .then((tree: TreeItem[]) => {
      dispatch(setTreeData(tree));
      dispatch(setTreeLoading(false));
    })
    .catch((error) => {
      console.error(error);
    });
};

export const getUpdateEntityFunction = (
  type: TreeEntityTypes
): ((
  db: IDBWrapper,
  id: string,
  newValues: Partial<PromptChain | Dataset | Workflow | ChainCollection>
) => Promise<void>) => {
  switch (type) {
    case TreeEntityTypes.COLLECTION:
      return updateChainCollection;
    case TreeEntityTypes.CHAIN:
      return updatePromptChain;
    case TreeEntityTypes.DATASET:
      return updateDataset;
    case TreeEntityTypes.WORKFLOW:
    default:
      return updateWorkflow;
  }
};
export const handleTreeDrop =
  (db: IDBWrapper, dispatch: AppDispatch) =>
  (item: TreeItem, collectionId?: string): void => {
    dispatch(setTreeLoading(true));
    const update = getUpdateEntityFunction(item.entityType);
    update(db, item.id, { CollectionID: collectionId })
      .then(() => {
        getTree(db, dispatch);
      })
      .catch((error) => {
        console.error(error);
      });
  };

export const updateButtonPosition =
  (setButtonPosition: (value: { top: number; left: number }) => void) =>
  (ref: React.RefObject<Element>): void => {
    if (ref.current) {
      const { top, right } = ref.current.getBoundingClientRect();
      setButtonPosition({ top: top - 30, left: right - 78 });
    }
  };

export const useTreeDrop = (
  handleDrop: (value: TreeItem) => void
): [unknown, ConnectDropTarget] => {
  return useDrop(() => ({
    accept: TREE_NODE_TYPE,
    drop: async (item: TreeItem, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        handleDrop(item);
      }
    },
  }));
};

export const deleteAllTreeItems = (
  db: IDBWrapper,
  model: Model,
  dispatch: AppDispatch
): void => {
  dispatch(setTreeLoading(true));
  deleteAllChainsAndCollections(db)
    .then(() => {
      getTree(db, dispatch);
      removeTabsetById(PROMPT_EDITOR_TAB_SET_ID, model);
      removeTabsetById(OUTPUTS_TAB_SET_ID, model);
      addNewTabsHandler(
        [
          {
            tabNodeJson: { ...tabMap.promptChainTab, id: uuidv4() },
            tabSetId: PROMPT_EDITOR_TAB_SET_ID,
            tabSetOrder: TabSetOrder.promptChain,
          },
        ],
        model,
        dispatch
      );
    })
    .catch((error) => {
      console.error(error);
    });
};

export const createEmptyCollection = (
  db: IDBWrapper,
  dispatch: AppDispatch
): void => {
  createNewCollection(db)
    .then(() => {
      getTree(db, dispatch);
    })
    .catch((error) => {
      console.error(error);
    });
};
