import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'hooks';
import { ReactComponent as FileTextIcon } from 'assets/icons/file-text.svg';
import { selectTreeItemById } from 'store/tree/treeSelectors';
import { setOpenedDatasetCell } from 'store/dataset/datasetSlice';
import { type CellInfo } from '../../Table';
import styles from './DatasetCellInfo.module.css';

interface DatasetCellInfoProps {
  datasetId: string;
  content: string;
  cellInfo: CellInfo;
}

export const DatasetCellInfo: React.FC<DatasetCellInfoProps> = ({
  datasetId,
  content,
  cellInfo,
}) => {
  const dispatch = useAppDispatch();
  const entityInfo = useAppSelector(selectTreeItemById(datasetId));
  const title = entityInfo
    ? `${entityInfo.label}, row: ${cellInfo.row}, col: ${cellInfo.columnName}`
    : '';

  useEffect(() => {
    return () => {
      dispatch(setOpenedDatasetCell(null));
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{title}</div>
      <div className={styles.main}>
        <div className={styles.column}>
          <FileTextIcon /> {cellInfo.columnName}
        </div>
        <div className={styles.content}>{content}</div>
      </div>
    </div>
  );
};
