import { createSelector } from '@reduxjs/toolkit';
import { type RootState } from 'store/store';
import { type Dataset } from 'db/workspaceDb';

const selectDatasets = (state: RootState): Record<string, Dataset> =>
  state.dataset.datasets;

export const selectDatasetById = (
  datasetId: string
): ((state: RootState) => Dataset | null) =>
  createSelector([selectDatasets], (datasets: Record<string, Dataset>) => {
    return datasets[datasetId] || null;
  });
