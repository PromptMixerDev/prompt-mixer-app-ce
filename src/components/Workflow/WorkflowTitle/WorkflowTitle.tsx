import React, { useContext } from 'react';
import { useAppDispatch, useAppSelector } from 'hooks';
import { DICTIONARY } from 'dictionary';
import { WorkspaceDatabaseContext } from 'contexts';
import { updateWorkflow } from 'db/workspaceDb';
import { updateTreeItem } from 'store/tree/treeSlice';
import { Title } from '../../Title';
import { updateTabAttributes } from '../../FlexLayout/FlexLayout.helper';

interface WorkflowTitleProps {
  workflowId: string;
}

export const WorkflowTitle: React.FC<WorkflowTitleProps> = ({ workflowId }) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { selectedEntityId } = useAppSelector((state) => state.selectedEntity);
  const { model } = useAppSelector((store) => store.flexLayoutModel);

  const handleTitleBlur = (title: string): void => {
    const newTitle = title || DICTIONARY.labels.untitled;
    if (selectedEntityId) {
      updateWorkflow(db, selectedEntityId, { Title: newTitle })
        .then(() => {
          updateTabAttributes(selectedEntityId, { name: newTitle }, model);
          dispatch(updateTreeItem({ id: selectedEntityId, label: newTitle }));
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return <Title entityId={workflowId} handleTitleBlur={handleTitleBlur} />;
};
