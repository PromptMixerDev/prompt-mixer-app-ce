import {
  type ConnectDropTarget,
  useDrag,
  useDrop,
  type ConnectDragPreview,
  type ConnectDragSource,
} from 'react-dnd';
import { type IDBWrapper, type PromptChain } from 'db/workspaceDb';
import { type IWorkflow } from 'store/workflow/workflowSlice';
import { type AppDispatch } from 'store/store';
import {
  type DropProps,
  type DragProps,
} from '../../Tree/TreeNode/TreeNode.helper';
import {
  CHAIN_TYPE,
  useWorkflowChainDropCallback,
} from '../WorkflowArea/WorkflowArea.helper';

export const useWorkflowChainDrag = (
  chain: PromptChain
): [DragProps, ConnectDragSource, ConnectDragPreview] => {
  return useDrag(() => ({
    type: CHAIN_TYPE,
    item: chain,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
};

export const useWorkflowChainDrop = (
  db: IDBWrapper,
  workflow: IWorkflow,
  order: number,
  dispatch: AppDispatch
): [DropProps, ConnectDropTarget] => {
  return useDrop(
    () => useWorkflowChainDropCallback(db, workflow, order, dispatch),
    [workflow]
  );
};
