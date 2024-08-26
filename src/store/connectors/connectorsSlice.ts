import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type IConnector } from 'components/ModelsSelector';

interface ConnectorsState {
  installedConnectors: IConnector[] | [];
}

const initialState: ConnectorsState = {
  installedConnectors: [],
};

const connectorsSlice = createSlice({
  name: 'connectors',
  initialState,
  reducers: {
    setInstalledConnectors(state, action: PayloadAction<IConnector[]>) {
      state.installedConnectors = action.payload;
    },
    updateConnector(state, action: PayloadAction<IConnector>) {
      const newInstalledConnectors: IConnector[] =
        state.installedConnectors.map((x) => {
          if (x.connectorName === action.payload.connectorName) {
            return action.payload;
          }

          return x;
        });

      state.installedConnectors = newInstalledConnectors;
    },
    resetConnectorsState() {
      return initialState;
    },
  },
});

export const { setInstalledConnectors, updateConnector, resetConnectorsState } =
  connectorsSlice.actions;
export default connectorsSlice.reducer;
