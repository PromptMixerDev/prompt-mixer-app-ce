import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export enum EntityType {
  promptChain = 'promptChain',
  dataset = 'dataset',
  workflow = 'workflow',
}

interface SelectedEntityState {
  selectedEntityId: string | undefined;
  selectedEntityType: EntityType | undefined;
}

const initialState: SelectedEntityState = {
  selectedEntityId: undefined,
  selectedEntityType: undefined,
};

const selectedEntitySlice = createSlice({
  name: 'selectedEntity',
  initialState,
  reducers: {
    setSelectedEntity(state, action: PayloadAction<SelectedEntityState>) {
      return action.payload;
    },
    resetSelectedEntityState() {
      return initialState;
    },
  },
});

export const { setSelectedEntity, resetSelectedEntityState } =
  selectedEntitySlice.actions;
export default selectedEntitySlice.reducer;
