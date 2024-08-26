import {
  type ConnectDropTarget,
  useDrop,
  type DropTargetMonitor,
} from 'react-dnd';
import {
  type IDBWrapper,
  TreeEntityTypes,
  type TreeItem,
  updateWorkflow,
  type PromptChain,
  getAllWorkflows,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import { type IWorkflow } from 'store/workflow/workflowSlice';
import { readAndSetWorkflow } from '../Workflow.helper';
import { TREE_NODE_TYPE } from '../../Tree/TreeNode';
import { type DropProps } from '../../Tree/TreeNode/TreeNode.helper';

export const CHAIN_TYPE = 'CHAIN';

export const handleDrop = (
  db: IDBWrapper,
  workflow: IWorkflow,
  id: string,
  order: number,
  dispatch: AppDispatch
): void => {
  const updatedChains = workflow.Chains.map((chain) => chain.ChainID)
    .toSpliced(order, 0, id)
    .filter((chainId, ind) => !(chainId === id && ind !== order));

  updateWorkflow(db, workflow.WorkflowID, {
    Chains: updatedChains,
  })
    .then(() => {
      readAndSetWorkflow(db, workflow.WorkflowID, dispatch);
    })
    .catch((error) => {
      console.error(error);
    });
};

const isTreeItem = (item: TreeItem | PromptChain): item is TreeItem => {
  return (item as TreeItem).entityType !== undefined;
};

export const useWorkflowChainDropCallback = (
  db: IDBWrapper,
  workflow: IWorkflow,
  order: number,
  dispatch: AppDispatch
): any => ({
  accept: [CHAIN_TYPE, TREE_NODE_TYPE],
  drop: async (item: TreeItem | PromptChain, monitor: DropTargetMonitor) => {
    if (monitor.isOver({ shallow: true })) {
      if (isTreeItem(item)) {
        if (item.entityType === TreeEntityTypes.CHAIN) {
          handleDrop(db, workflow, item.id, order, dispatch);
        }
      } else {
        handleDrop(db, workflow, item.ChainID, order, dispatch);
      }
    }
  },
  collect: (monitor: DropTargetMonitor) => ({
    isOver: monitor.isOver(),
  }),
});

export const useWorkflowAreaDrop = (
  db: IDBWrapper,
  workflow: IWorkflow,
  dispatch: AppDispatch
): [unknown, ConnectDropTarget] => {
  const order = workflow.Chains.length;
  return useDrop(
    () => useWorkflowChainDropCallback(db, workflow, order, dispatch),
    [workflow]
  );
};

export const useTopBlockDrop = (
  db: IDBWrapper,
  workflow: IWorkflow,
  dispatch: AppDispatch
): [DropProps, ConnectDropTarget] => {
  return useDrop(
    () => useWorkflowChainDropCallback(db, workflow, 0, dispatch),
    [workflow]
  );
};

export const removeWorkflowChain = (
  db: IDBWrapper,
  removedChainId: string,
  workflow: IWorkflow,
  dispatch: AppDispatch
): void => {
  const updatedChains = workflow.Chains.map((chain) => chain.ChainID).filter(
    (chainId) => chainId !== removedChainId
  );
  updateWorkflow(db, workflow.WorkflowID, {
    Chains: updatedChains,
  })
    .then(() => {
      readAndSetWorkflow(db, workflow.WorkflowID, dispatch);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const processChainDeletion = (
  db: IDBWrapper,
  removedChainId: string,
  dispatch: AppDispatch
): void => {
  getAllWorkflows(db)
    .then((workflows) => {
      workflows.forEach((workflow) => {
        if (workflow.Chains?.includes(removedChainId)) {
          const updatedChains = workflow.Chains.filter(
            (chainId) => chainId !== removedChainId
          );
          updateWorkflow(db, workflow.WorkflowID, {
            Chains: updatedChains,
          })
            .then(() => {
              readAndSetWorkflow(db, workflow.WorkflowID, dispatch);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    })
    .catch((error) => {
      console.error(error);
    });
};
