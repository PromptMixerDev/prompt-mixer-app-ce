import React, { useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'hooks';
import { WorkspaceDatabaseContext } from 'contexts';
import { addDataset, setOpenedDatasetCell } from 'store/dataset/datasetSlice';
import {
  EntityType,
  setSelectedEntity,
} from 'store/selectedEntity/selectedEntitySlice';
import { selectDatasetById } from 'store/dataset/datasetSelectors';
import { DatasetTitle } from './DatasetTitle';
import { DatasetUploader } from './DatasetUploader';
import { Spinner } from '../Spinner';
import { Table, type CellInfo } from '../Table/Table';
import {
  addNewTabsHandler,
  removeTabById,
} from '../FlexLayout/FlexLayout.helper';
import { DATASET_CELL_TAB_ID } from '../FlexLayout/FlexLayout.config';
import {
  getCellTabInfo,
  getDefaultDataset,
  handleCreateOrUpdateDataset,
  readAndSetDataset,
} from './Dataset.helper';
import styles from './Dataset.module.css';

interface DatasetProps {
  tabId: string;
  datasetId?: string;
}

export interface DatasetInfo {
  headers: string[];
  data: any[];
}

export const Dataset: React.FC<DatasetProps> = ({ tabId, datasetId }) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { openedDatasetCell } = useAppSelector((store) => store.dataset);
  const { model } = useAppSelector((store) => store.flexLayoutModel);
  const dataset = useAppSelector(selectDatasetById(datasetId ?? tabId));
  const [isLoading, setLoading] = useState(false);
  const openedCell =
    openedDatasetCell && openedDatasetCell.datasetId === datasetId
      ? openedDatasetCell.info
      : null;

  useEffect(() => {
    if (datasetId) {
      setLoading(true);
      dispatch(
        setSelectedEntity({
          selectedEntityId: datasetId,
          selectedEntityType: EntityType.dataset,
        })
      );
      readAndSetDataset(db, datasetId, setLoading, dispatch);
    } else {
      dispatch(
        setSelectedEntity({
          selectedEntityId: undefined,
          selectedEntityType: EntityType.dataset,
        })
      );
      dispatch(addDataset(getDefaultDataset(tabId)));
    }
  }, []);

  const handleUpdateDataset = (value: DatasetInfo): void => {
    handleCreateOrUpdateDataset(db, datasetId, value, tabId, dispatch);
  };

  const onCellClick = (value: CellInfo): void => {
    dispatch(
      setOpenedDatasetCell({
        datasetId: datasetId!,
        info: value,
      })
    );
    const cellContent: string =
      dataset?.Data?.[value.row - 1]?.[value.columnName];
    removeTabById(DATASET_CELL_TAB_ID, model);
    addNewTabsHandler(
      getCellTabInfo(tabId, value, cellContent),
      model,
      dispatch
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}></div>
      <div className={styles.content}>
        <DatasetTitle tabId={tabId} datasetId={datasetId} />
        {isLoading && <Spinner />}
        {!isLoading && !dataset?.Data && !dataset?.Headers && (
          <DatasetUploader handleUpdateDataset={handleUpdateDataset} />
        )}
        {!isLoading && (dataset?.Data ?? dataset?.Headers) && (
          <Table
            headers={dataset.Headers!}
            data={dataset.Data!}
            onCellClick={onCellClick}
            activeCell={openedCell}
          />
        )}
      </div>
    </div>
  );
};
