import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Output } from 'db/workspaceDb';

export interface OutputType extends Output {
  activeStep: number;
}

interface OutputFilters {
  model: { name: string; checked: false }[] | null;
  rating: { name: string; checked: false }[] | null;
  search: string | null;
}
interface OutputsState {
  outputs: Record<string, OutputType[]>;
  filters: Record<string, OutputFilters[]>;
  modelLists: Record<string, string[]>;
}

const initialState: OutputsState = {
  outputs: {},
  filters: {},
  modelLists: {},
};

const outputsSlice = createSlice({
  name: 'outputs',
  initialState,
  reducers: {
    setOutputs(
      state,
      action: PayloadAction<{ chainId: string; outputs: Output[] }>
    ) {
      const { chainId, outputs } = action.payload;
      state.outputs[chainId] = outputs.map((output) => ({
        ...output,
        activeStep: output.PromptVersions?.length - 1,
      }));
    },
    addOutput(
      state,
      action: PayloadAction<{ chainId: string; output: Output }>
    ) {
      const { chainId, output } = action.payload;
      if (!state.outputs[chainId]) {
        state.outputs[chainId] = [];
      }
      state.outputs[chainId].unshift({
        ...output,
        activeStep: output.PromptVersions?.length - 1,
      });
    },
    updateOutput(
      state,
      action: PayloadAction<{
        chainId: string;
        id: string;
        output: Partial<OutputType>;
      }>
    ) {
      const { chainId, id, output } = action.payload;
      const outputsArray = state.outputs[chainId];
      if (outputsArray) {
        const outputIndex = outputsArray.findIndex(
          (out) => out.OutputID === id
        );
        if (outputIndex !== -1) {
          const existingOutput = outputsArray[outputIndex];
          outputsArray[outputIndex] = {
            ...existingOutput,
            ...output,
          };
        }
      }
    },
    deleteOutput(
      state,
      action: PayloadAction<{
        chainId: string;
        id: string;
      }>
    ) {
      const { chainId, id } = action.payload;
      const outputsArray = state.outputs[chainId];
      if (outputsArray) {
        state.outputs[chainId] = outputsArray.filter(
          (el) => el.OutputID !== id
        );
      }
    },
    resetOutputState() {
      return initialState;
    },
  },
});

export const {
  addOutput,
  updateOutput,
  deleteOutput,
  setOutputs,
  resetOutputState,
} = outputsSlice.actions;
export default outputsSlice.reducer;
