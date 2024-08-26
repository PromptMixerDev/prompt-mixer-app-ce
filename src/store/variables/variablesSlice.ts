import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Variable } from 'db/workspaceDb';

interface variablesState {
  variables: Record<string, Variable[]>;
}

const initialState: variablesState = {
  variables: {},
};

const variablesSlice = createSlice({
  name: 'variables',
  initialState,
  reducers: {
    addVariables(
      state,
      action: PayloadAction<{
        chainId: string;
        variables: Variable[];
      }>
    ) {
      const { chainId, variables } = action.payload;
      state.variables[chainId] = variables;
    },
    updateVariables(
      state,
      action: PayloadAction<{
        chainId: string;
        variables: Variable[];
      }>
    ) {
      const { chainId, variables } = action.payload;
      if (state.variables[chainId]) {
        state.variables[chainId] = variables;
      }
    },
    resetVariablesState() {
      return initialState;
    },
  },
});

export const { addVariables, updateVariables, resetVariablesState } =
  variablesSlice.actions;
export default variablesSlice.reducer;
