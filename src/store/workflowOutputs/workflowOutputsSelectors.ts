import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from 'store/store';
import { type WorkflowOutputType } from './workflowOutputsSlice';

const selectWorkflowOutputs = (
  state: RootState
): Record<string, WorkflowOutputType[]> =>
  state.workflowOutputs.workflowOutputs;

export const selectWorkflowOutputsByWorkflowId = (
  workflowId: string | undefined
): ((state: RootState) => WorkflowOutputType[]) =>
  createSelector(
    [selectWorkflowOutputs],
    (workflowOutputs: Record<string, WorkflowOutputType[]>) => {
      if (workflowId) {
        return workflowOutputs[workflowId] || [];
      }
      return [];
    }
  );
