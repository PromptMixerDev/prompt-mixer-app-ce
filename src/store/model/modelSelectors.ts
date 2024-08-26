import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from 'store/store';
import { type ModelType } from './modelSlice';

const selectModels = (state: RootState): Record<string, ModelType[]> =>
  state.model.models;

export const selectModelsByChainId = (
  chainId: string | undefined
): ((state: RootState) => ModelType[]) =>
  createSelector([selectModels], (models: Record<string, ModelType[]>) => {
    if (chainId) {
      return models[chainId] || [];
    }
    return [];
  });

export const selectWorkflowModels = (
  chainIds: string[]
): ((state: RootState) => Record<string, ModelType | undefined>) =>
  createSelector([selectModels], (models: Record<string, ModelType[]>) => {
    const result: Record<string, ModelType | undefined> = {};
    chainIds.forEach((chainId) => {
      const chainModels = models[chainId] || [];
      const sortedChainModels = chainModels.toSorted(
        (a, b) => a.Order - b.Order
      );
      const model = sortedChainModels.find((model) => model.Model);
      result[chainId] = model;
    });
    return result;
  });
