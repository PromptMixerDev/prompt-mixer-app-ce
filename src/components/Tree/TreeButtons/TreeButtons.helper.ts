import { type Model } from 'flexlayout-react';
import { type IDBWrapper } from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import { DICTIONARY } from 'dictionary';
import { ReactComponent as DatasetIcon } from 'assets/icons/dataset.svg';
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg';
import { ReactComponent as WorkflowIcon } from 'assets/icons/workflow.svg';
import { type ContextMenuOption } from '../../Modals/ContextMenuWithOptions';
import {
  createNewDataset,
  createNewWorkflow,
} from '../../FlexLayout/FlexLayout.helper';

export const getContextMenuOptions = (
  db: IDBWrapper,
  model: Model,
  dispatch: AppDispatch,
  setShowConfirmModal: (value: boolean) => void
): ContextMenuOption[][] => [
  [
    {
      label: DICTIONARY.labels.uploadNewDataset,
      icon: DatasetIcon,
      onClick: () => createNewDataset(db, model, dispatch),
    },
    {
      label: DICTIONARY.labels.createNewWorkflow,
      icon: WorkflowIcon,
      onClick: () => createNewWorkflow(db, model, dispatch),
    },
  ],
  [
    {
      label: DICTIONARY.labels.deleteAll,
      icon: DeleteIcon,
      onClick: () => setShowConfirmModal(true),
    },
  ],
];
