import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Dataset } from 'db/workspaceDb';
import { type CellInfo } from 'components/Table';

export interface DatasetType {
  DatasetID: string;
  Title: string;
  Headers?: string[];
}

interface OpenedDatasetCell {
  datasetId: string;
  info: CellInfo;
}

interface DatasetState {
  datasetsInfo: DatasetType[];
  openedDatasetCell: OpenedDatasetCell | null;
  datasets: Record<string, Dataset>;
}

const initialState: DatasetState = {
  datasetsInfo: [],
  openedDatasetCell: null,
  datasets: {},
};

const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setDatasetsInfo(state, action: PayloadAction<Dataset[]>) {
      state.datasetsInfo = action.payload.map((dataset: Dataset) => ({
        DatasetID: dataset.DatasetID,
        Title: dataset.Title,
        Headers: dataset.Headers,
      }));
    },
    setOpenedDatasetCell(
      state,
      action: PayloadAction<OpenedDatasetCell | null>
    ) {
      state.openedDatasetCell = action.payload;
    },
    addDataset(state, action: PayloadAction<Dataset>) {
      const { DatasetID } = action.payload;
      state.datasets[DatasetID] = action.payload;
    },
    updateDataset(
      state,
      action: PayloadAction<{
        id: string;
        dataset: Partial<Dataset>;
      }>
    ) {
      const { id, dataset } = action.payload;
      const existingDataset = state.datasets[id];
      if (existingDataset) {
        state.datasets[id] = {
          ...existingDataset,
          ...dataset,
        };
      }
    },
    resetDatasetState() {
      return initialState;
    },
  },
});

export const {
  setDatasetsInfo,
  setOpenedDatasetCell,
  addDataset,
  updateDataset,
  resetDatasetState,
} = datasetSlice.actions;
export default datasetSlice.reducer;
