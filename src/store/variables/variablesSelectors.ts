import { createSelector } from '@reduxjs/toolkit';
import { type Variable } from 'db/workspaceDb';
import { type RootState } from 'store/store';

const selectVariables = (state: RootState): Record<string, Variable[]> =>
  state.variables.variables;

export const selectVariablesByChainId = (
  chainId: string
): ((state: RootState) => Variable[]) =>
  createSelector([selectVariables], (variables: Record<string, Variable[]>) => {
    return variables[chainId] || [];
  });

export const selectWorkflowVariables = (
  chainIds: string[],
  workflowId: string
): ((state: RootState) => Variable[]) => {
  return createSelector(
    [selectVariables],
    (variables: Record<string, Variable[]>) => {
      return chainIds.flatMap((chainId) =>
        (variables[chainId] || []).map((variable) => ({
          ...variable,
          Value: variable.WorkflowValues?.[workflowId],
        }))
      );
    }
  );
};
