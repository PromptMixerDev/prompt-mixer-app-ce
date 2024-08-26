import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from 'store/store';
import { type IWorkflow } from './workflowSlice';

const selectWorkflows = (state: RootState): Record<string, IWorkflow> =>
  state.workflow.workflows;

export const selectWorkflowById = (
  workflowId: string
): ((state: RootState) => IWorkflow | null) =>
  createSelector([selectWorkflows], (workflows: Record<string, IWorkflow>) => {
    return workflows[workflowId] || null;
  });
