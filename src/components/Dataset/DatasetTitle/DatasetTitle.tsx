import React, { useContext } from 'react';
import { createDataset, updateDataset } from 'db/workspaceDb';
import { useAppDispatch, useAppSelector } from 'hooks';
import { DICTIONARY } from 'dictionary';
import { WorkspaceDatabaseContext } from 'contexts';
import { updateTreeItem } from 'store/tree/treeSlice';
import {
  EntityType,
  setSelectedEntity,
} from 'store/selectedEntity/selectedEntitySlice';
import { getTree } from '../../Tree/Tree.helper';
import { Title } from '../../Title';
import { readAndSetDatasets } from '../Dataset.helper';
import { updateTabAttributes } from '../../FlexLayout/FlexLayout.helper';

interface DatasetTitleProps {
  tabId: string;
  datasetId?: string;
}

export const DatasetTitle: React.FC<DatasetTitleProps> = ({
  tabId,
  datasetId,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { selectedEntityId } = useAppSelector((state) => state.selectedEntity);
  const { model } = useAppSelector((store) => store.flexLayoutModel);

  const handleTitleBlur = (title: string): void => {
    const newTitle = title || DICTIONARY.labels.untitled;
    if (selectedEntityId) {
      updateDataset(db, selectedEntityId, { Title: newTitle })
        .then(() => {
          updateTabAttributes(selectedEntityId, { name: newTitle }, model);
          dispatch(updateTreeItem({ id: selectedEntityId, label: newTitle }));
          readAndSetDatasets(db, dispatch);
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      dispatch(
        setSelectedEntity({
          selectedEntityId: tabId,
          selectedEntityType: EntityType.dataset,
        })
      );
      createDataset(db, { DatasetID: tabId, Title: newTitle })
        .then((dataset) => {
          updateTabAttributes(
            dataset.DatasetID,
            {
              name: newTitle,
              config: { datasetId: dataset.DatasetID },
            },
            model
          );
          getTree(db, dispatch);
          readAndSetDatasets(db, dispatch);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return <Title entityId={datasetId} handleTitleBlur={handleTitleBlur} />;
};
