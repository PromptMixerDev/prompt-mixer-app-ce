import { DICTIONARY } from 'dictionary';
import {
  type IDBWrapper,
  getDatasetById,
  updateDataset,
  createDataset,
  getDatasets,
  type Dataset,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import {
  addDataset,
  updateDataset as updateReduxDataset,
  setDatasetsInfo,
} from 'store/dataset/datasetSlice';
import {
  EntityType,
  setSelectedEntity,
} from 'store/selectedEntity/selectedEntitySlice';
import { type CellInfo } from '../Table/Table';
import { type DatasetInfo } from './Dataset';
import { getTree } from '../Tree/Tree.helper';
import { type TabInfo } from '../FlexLayout/FlexLayout.helper';
import {
  DATASET_CELL_TAB_SET_ID,
  TabSetOrder,
  tabMap,
} from '../FlexLayout/FlexLayout.config';

export const readAndSetDatasets = (
  db: IDBWrapper,
  dispatch: AppDispatch
): void => {
  getDatasets(db)
    .then((datasets: Dataset[]) => {
      dispatch(setDatasetsInfo(datasets));
    })
    .catch((error) => {
      console.error(error);
    });
};

export const readAndSetDataset = (
  db: IDBWrapper,
  datasetId: string,
  setLoading: (value: boolean) => void,
  dispatch: AppDispatch
): void => {
  getDatasetById(db, datasetId)
    .then((dataset) => {
      dispatch(addDataset(dataset));
      setLoading(false);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const handleCreateOrUpdateDataset = (
  db: IDBWrapper,
  datasetId: string | undefined,
  datasetInfo: DatasetInfo,
  tabId: string,
  dispatch: AppDispatch
): void => {
  if (datasetId) {
    updateDataset(db, datasetId, {
      Headers: datasetInfo?.headers,
      Data: datasetInfo?.data,
    })
      .then(() => {
        readAndSetDatasets(db, dispatch);
        dispatch(
          updateReduxDataset({
            id: datasetId,
            dataset: { Data: datasetInfo.data, Headers: datasetInfo.headers },
          })
        );
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    createDataset(db, {
      DatasetID: tabId,
      Headers: datasetInfo?.headers,
      Data: datasetInfo?.data,
    })
      .then((dataset) => {
        dispatch(
          setSelectedEntity({
            selectedEntityId: dataset.DatasetID,
            selectedEntityType: EntityType.dataset,
          })
        );
        dispatch(addDataset(dataset));
        getTree(db, dispatch);
        readAndSetDatasets(db, dispatch);
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

export const getCellTabInfo = (
  id: string,
  cellInfo: CellInfo,
  content: string
): TabInfo[] => {
  const datasetCellTabNodeJson = {
    ...tabMap.datasetCellTab,
    name: `Row: ${cellInfo.row}, col: ${cellInfo.columnName}`,
    config: {
      ...tabMap.datasetCellTab.config,
      datasetId: id,
      content,
      cellInfo,
    },
  };

  return [
    {
      tabNodeJson: datasetCellTabNodeJson,
      tabSetId: DATASET_CELL_TAB_SET_ID,
      tabSetOrder: TabSetOrder.datasetCell,
    },
  ];
};

export const getDefaultDataset = (id: string): Dataset => ({
  DatasetID: id,
  Title: DICTIONARY.labels.untitled,
  CreatedAt: new Date(),
});
