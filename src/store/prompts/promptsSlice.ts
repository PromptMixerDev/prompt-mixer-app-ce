import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  type DefaultPromptItem,
  type IPromptItem,
} from 'components/PromptEditor';

export type PromptItemType = DefaultPromptItem | IPromptItem;

interface promptsState {
  promptItems: Record<string, PromptItemType[]>;
}

const initialState: promptsState = {
  promptItems: {},
};

const promptsSlice = createSlice({
  name: 'prompts',
  initialState,
  reducers: {
    addPromptItems(
      state,
      action: PayloadAction<{
        chainId: string;
        promptItems: PromptItemType[];
      }>
    ) {
      const { chainId, promptItems } = action.payload;
      state.promptItems[chainId] = promptItems;
    },
    updatePromptItems(
      state,
      action: PayloadAction<{
        chainId: string;
        promptItems: PromptItemType[];
      }>
    ) {
      const { chainId, promptItems } = action.payload;
      if (state.promptItems[chainId]) {
        state.promptItems[chainId] = promptItems;
      }
    },
    resetPromptsState() {
      return initialState;
    },
  },
});

export const { addPromptItems, updatePromptItems, resetPromptsState } =
  promptsSlice.actions;
export default promptsSlice.reducer;
