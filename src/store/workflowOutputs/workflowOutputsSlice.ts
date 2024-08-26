import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type WorkflowOutput } from 'db/workspaceDb';

export interface WorkflowOutputType extends WorkflowOutput {
  activeStep: number;
}

interface WorkflowOutputsState {
  workflowOutputs: Record<string, WorkflowOutputType[]>;
}

const initialState: WorkflowOutputsState = {
  workflowOutputs: {},
};

const workflowOutputsSlice = createSlice({
  name: 'workflowOutputs',
  initialState,
  reducers: {
    setWorkflowOutputs(
      state,
      action: PayloadAction<{
        workflowId: string;
        workflowOutputs: WorkflowOutput[];
      }>
    ) {
      const { workflowId, workflowOutputs } = action.payload;
      state.workflowOutputs[workflowId] = workflowOutputs.map((output) => ({
        ...output,
        activeStep: output.Completions?.length - 1,
      }));
    },
    addOrUpdateWorkflowOutput(
      state,
      action: PayloadAction<{
        workflowId: string;
        workflowOutput: WorkflowOutputType;
      }>
    ) {
      const { workflowId, workflowOutput } = action.payload;
      if (!state.workflowOutputs[workflowId]) {
        state.workflowOutputs[workflowId] = [];
      }
      const workflowOutputsArray = state.workflowOutputs[workflowId];
      const workflowOutputIndex = workflowOutputsArray.findIndex(
        (out) => out.OutputID === workflowOutput.OutputID
      );
      if (workflowOutputIndex === -1) {
        state.workflowOutputs[workflowId].unshift({
          ...workflowOutput,
          activeStep: workflowOutput.Completions?.length - 1,
        });
      } else {
        const existingOutput = workflowOutputsArray[workflowOutputIndex];
        workflowOutputsArray[workflowOutputIndex] = {
          ...existingOutput,
          ...workflowOutput,
        };
      }
    },
    updateWorkflowOutput(
      state,
      action: PayloadAction<{
        workflowId: string;
        id: string;
        workflowOutput: Partial<WorkflowOutputType>;
      }>
    ) {
      const { workflowId, id, workflowOutput } = action.payload;
      const workflowOutputsArray = state.workflowOutputs[workflowId];
      if (workflowOutputsArray) {
        const workflowOutputIndex = workflowOutputsArray.findIndex(
          (out) => out.OutputID === id
        );
        if (workflowOutputIndex !== -1) {
          const existingOutput = workflowOutputsArray[workflowOutputIndex];
          workflowOutputsArray[workflowOutputIndex] = {
            ...existingOutput,
            ...workflowOutput,
          };
        }
      }
    },
    deleteWorkflowOutput(
      state,
      action: PayloadAction<{
        workflowId: string;
        id: string;
      }>
    ) {
      const { workflowId, id } = action.payload;
      const workflowOutputsArray = state.workflowOutputs[workflowId];
      if (workflowOutputsArray) {
        state.workflowOutputs[workflowId] = workflowOutputsArray.filter(
          (el) => el.OutputID !== id
        );
      }
    },
    resetWorkflowOutputsState() {
      return initialState;
    },
  },
});

export const {
  addOrUpdateWorkflowOutput,
  updateWorkflowOutput,
  deleteWorkflowOutput,
  setWorkflowOutputs,
  resetWorkflowOutputsState,
} = workflowOutputsSlice.actions;
export default workflowOutputsSlice.reducer;
