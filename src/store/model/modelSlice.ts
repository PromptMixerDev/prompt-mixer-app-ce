import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type IModel } from 'components/ModelsSelector';
import { type ChainModel } from 'db/workspaceDb';

export type ModelType = ChainModel | IModel;
interface ModelState {
  runningModels: Record<string, string[]>;
  models: Record<string, ModelType[]>;
}

const initialState: ModelState = {
  runningModels: {},
  models: {},
};

const modelSlice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    addRunningModel(
      state,
      action: PayloadAction<{ id: string; model: string }>
    ) {
      const { id, model } = action.payload;
      if (state.runningModels[id]) {
        state.runningModels[id].push(model);
      } else {
        state.runningModels[id] = [model];
      }
    },
    removeRunningModel(
      state,
      action: PayloadAction<{ id: string; model: string }>
    ) {
      const { id, model } = action.payload;
      if (state.runningModels[id]) {
        const index = state.runningModels[id].indexOf(model);
        if (index !== -1) {
          state.runningModels[id].splice(index, 1);
        }
      }
    },
    setModelsByChainId(
      state,
      action: PayloadAction<{ chainId: string; models: ModelType[] }>
    ) {
      const { chainId, models } = action.payload;
      state.models[chainId] = models;
    },
    resetModelState() {
      return initialState;
    },
  },
});

export const {
  addRunningModel,
  removeRunningModel,
  setModelsByChainId,
  resetModelState,
} = modelSlice.actions;
export default modelSlice.reducer;
