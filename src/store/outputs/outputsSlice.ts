import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Output } from 'db/workspaceDb';

export interface OutputType extends Output {
  activeStep: number;
}

export enum OutputRating {
  Nice = 'Nice',
  Neutral = 'Neutral',
  Dislike = 'Dislike',
}

export enum FilterType {
  model = 'model',
  rating = 'rating',
}

export interface FilterItem {
  name: string;
  checked: boolean;
}

export interface OutputFilters {
  model: FilterItem[];
  rating: FilterItem[];
  search: string | null;
}
interface OutputsState {
  outputs: Record<string, OutputType[]>;
  filters: Record<string, OutputFilters>;
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
    updateOutputFilters(
      state,
      action: PayloadAction<{ chainId: string; outputs?: Output[] }>
    ) {
      const { chainId, outputs } = action.payload;
      const currentOutputs = outputs || state.outputs[chainId] || [];
      const modelTypes = [
        ...new Set(currentOutputs.map((output) => output.ModelType)),
      ];

      if (!state.filters[chainId]) {
        state.filters[chainId] = {
          model: modelTypes.map((model) => ({ name: model, checked: false })),
          rating: [
            { name: OutputRating.Nice, checked: false },
            { name: OutputRating.Neutral, checked: false },
            { name: OutputRating.Dislike, checked: false },
          ],
          search: null,
        };
      }

      const existingModelFilters = state.filters[chainId].model;

      modelTypes.forEach((modelType) => {
        if (!existingModelFilters.some((filter) => filter.name === modelType)) {
          existingModelFilters.push({ name: modelType, checked: false });
        }
      });

      state.filters[chainId].model = existingModelFilters.filter((filter) =>
        modelTypes.includes(filter.name)
      );
    },
    updateFilterOption(
      state,
      action: PayloadAction<{
        chainId: string;
        filterType: FilterType;
        optionName: string;
      }>
    ) {
      const { chainId, filterType, optionName } = action.payload;
      const filters = state.filters[chainId];
      if (filters) {
        const filterArray = filters[filterType];
        const filterItem = filterArray.find((item) => item.name === optionName);
        if (filterItem) {
          filterItem.checked = !filterItem.checked;
        }
      }
    },
    updateSearchFilter(
      state,
      action: PayloadAction<{
        chainId: string;
        searchKey: string | null;
      }>
    ) {
      const { chainId, searchKey } = action.payload;
      if (state.filters[chainId]) {
        state.filters[chainId].search = searchKey;
      }
    },
    clearFilters(state, action: PayloadAction<{ chainId: string }>) {
      const { chainId } = action.payload;
      if (state.filters[chainId]) {
        state.filters[chainId] = {
          model: state.filters[chainId].model.map((item) => ({
            ...item,
            checked: false,
          })),
          rating: state.filters[chainId].rating.map((item) => ({
            ...item,
            checked: false,
          })),
          search: null,
        };
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
  updateOutputFilters,
  updateFilterOption,
  updateSearchFilter,
  clearFilters,
  resetOutputState,
} = outputsSlice.actions;
export default outputsSlice.reducer;
