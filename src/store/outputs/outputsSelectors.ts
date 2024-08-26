import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from 'store/store';
import { type OutputType } from './outputsSlice';

const selectOutputs = (state: RootState): Record<string, OutputType[]> =>
  state.outputs.outputs;

export const selectOutputsByChainId = (
  chainId: string | undefined
): ((state: RootState) => OutputType[]) =>
  createSelector([selectOutputs], (outputs: Record<string, OutputType[]>) => {
    if (chainId) {
      return outputs[chainId] || [];
    }
    return [];
  });
