import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from 'store/store';
import { type PromptItemType } from './promptsSlice';

const selectPromptItems = (
  state: RootState
): Record<string, PromptItemType[]> => state.prompts.promptItems;

export const selectPromptItemsByChainId = (
  chainId: string
): ((state: RootState) => PromptItemType[]) =>
  createSelector(
    [selectPromptItems],
    (promptItems: Record<string, PromptItemType[]>) => {
      return promptItems[chainId] || [];
    }
  );

export const selectWorkflowPromptItems = (
  chainIds: string[]
): ((state: RootState) => Record<string, PromptItemType[]>) =>
  createSelector(
    [selectPromptItems],
    (promptItems: Record<string, PromptItemType[]>) => {
      const result: Record<string, PromptItemType[]> = {};
      chainIds.forEach((chainId) => {
        result[chainId] = promptItems[chainId] || [];
      });
      return result;
    }
  );
