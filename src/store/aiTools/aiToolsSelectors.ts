import { createSelector } from '@reduxjs/toolkit';
import { IAITool } from 'components/AITools';
import { type RootState } from 'store/store';

const selectAITools = (state: RootState): Record<string, IAITool[]> =>
  state.aiTools.aiTools;

export const selectAIToolsByChainId = (
  chainId: string
): ((state: RootState) => IAITool[]) =>
  createSelector([selectAITools], (aiTools: Record<string, IAITool[]>) => {
    return aiTools[chainId] || [];
  });
