import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type PromptChain, type Workflow } from 'db/workspaceDb';

export interface IWorkflow extends Omit<Workflow, 'Chains'> {
  Chains: PromptChain[];
}

interface WorkflowState {
  workflows: Record<string, IWorkflow>;
}

const initialState: WorkflowState = {
  workflows: {},
};

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    addWorkflow(state, action: PayloadAction<IWorkflow>) {
      const { WorkflowID } = action.payload;
      state.workflows[WorkflowID] = action.payload;
    },
    updateWorkflow(
      state,
      action: PayloadAction<{
        id: string;
        workflow: Partial<IWorkflow>;
      }>
    ) {
      const { id, workflow } = action.payload;
      const existingWorkflow = state.workflows[id];
      if (existingWorkflow) {
        state.workflows[id] = {
          ...existingWorkflow,
          ...workflow,
        };
      }
    },
    resetWorkflowState() {
      return initialState;
    },
  },
});

export const { resetWorkflowState, addWorkflow, updateWorkflow } =
  workflowSlice.actions;
export default workflowSlice.reducer;
