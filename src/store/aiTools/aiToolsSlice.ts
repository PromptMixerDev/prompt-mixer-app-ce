import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { IAITool } from 'components/AITools';
import { AITool } from 'db/workspaceDb';

interface aiToolsState {
  aiTools: Record<string, IAITool[]>;
}

const initialState: aiToolsState = {
  aiTools: {},
};

const aiToolsSlice = createSlice({
  name: 'aiTools',
  initialState,
  reducers: {
    addAITools(
      state,
      action: PayloadAction<{
        chainId: string;
        aiTools: AITool[];
      }>
    ) {
      const { chainId, aiTools } = action.payload;
      state.aiTools[chainId] = aiTools;
    },
    addAITool(
      state,
      action: PayloadAction<{
        chainId: string;
        aiTool: IAITool;
      }>
    ) {
      const { chainId, aiTool } = action.payload;
      if (!state.aiTools[chainId]) {
        state.aiTools[chainId] = [];
      }
      state.aiTools[chainId].push(aiTool);
    },
    updateAITool(
      state,
      action: PayloadAction<{
        chainId: string;
        aiTool: IAITool;
      }>
    ) {
      const { chainId, aiTool } = action.payload;
      if (!state.aiTools[chainId]) {
        state.aiTools[chainId] = [];
      }
      const aiToolIndex = state.aiTools[chainId].findIndex(
        (tool) => tool.AIToolID === aiTool.AIToolID
      );
      if (aiToolIndex !== -1) {
        state.aiTools[chainId][aiToolIndex] = aiTool;
      } else {
        state.aiTools[chainId].push(aiTool);
      }
    },
    deleteAITool(
      state,
      action: PayloadAction<{
        chainId: string;
        aiTool: IAITool;
      }>
    ) {
      const { chainId, aiTool } = action.payload;
      if (!state.aiTools[chainId]) {
        state.aiTools[chainId] = [];
      }
      state.aiTools[chainId] = state.aiTools[chainId].filter(
        (tool) => tool.AIToolID !== aiTool.AIToolID
      );
    },
    resetAIToolsState() {
      return initialState;
    },
  },
});

export const {
  addAITools,
  addAITool,
  updateAITool,
  deleteAITool,
  resetAIToolsState,
} = aiToolsSlice.actions;
export default aiToolsSlice.reducer;
