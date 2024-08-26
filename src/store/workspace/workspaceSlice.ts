import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { Workspace } from 'db/commonDb';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Partial<Workspace> | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  activeWorkspace: null,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setActiveWorkspace(
      state,
      action: PayloadAction<Partial<Workspace> | null>
    ) {
      state.activeWorkspace = action.payload;
    },
  },
});

export const { setActiveWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;
