import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Model } from 'flexlayout-react';
import { getLayoutModel } from 'components/FlexLayout/FlexLayout.helper';

interface FlexLayoutModelState {
  model: Model;
}

const initialState: FlexLayoutModelState = {
  model: getLayoutModel(),
};

const flexLayoutModelSlice = createSlice({
  name: 'flexLayoutModel',
  initialState,
  reducers: {
    setModel(state, action: PayloadAction<Model>) {
      state.model = action.payload;
    },
  },
});

export const { setModel } = flexLayoutModelSlice.actions;
export default flexLayoutModelSlice.reducer;
