import { DICTIONARY } from 'dictionary';
import {
  type IDBWrapper,
  type Output,
  updateOutput,
  getLoadingOutputs,
  getOutputsByChainId,
  getWorkflowOutputsByWorkflowId,
  type WorkflowOutput,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import { type OutputType, setOutputs } from 'store/outputs/outputsSlice';
import {
  type WorkflowOutputType,
  setWorkflowOutputs,
} from 'store/workflowOutputs/workflowOutputsSlice';
import { downloadJsonFile } from 'utils/downloadJsonFile';
import { ReactComponent as ArrowRightUpIcon } from 'assets/icons/arrow-right-up.svg';
import { ReactComponent as BrushIcon } from 'assets/icons/brush.svg';
import { type ContextMenuOption } from '../Modals/ContextMenuWithOptions';
import { NotificationTypes } from '../NotificationProvider/Notification';

export const getDotMenuOptions = (
  outputs: OutputType[] | WorkflowOutputType[],
  setDotMenuVisible: (value: boolean) => void,
  addNotification: (type: NotificationTypes, value: string) => void,
  handleDeleteAllOutputs: () => void
): ContextMenuOption[][] => [
  [
    {
      label: DICTIONARY.labels.exportJSON,
      icon: ArrowRightUpIcon,
      onClick: () => {
        setDotMenuVisible(false);
        if (!outputs?.length) {
          addNotification(
            NotificationTypes.error,
            DICTIONARY.notifications.noOutputToExport
          );
        } else {
          downloadJsonFile(outputs, 'outputs.json');
        }
      },
    },
  ],
  [
    {
      label: DICTIONARY.labels.clearContent,
      icon: BrushIcon,
      onClick: () => {
        setDotMenuVisible(false);
        handleDeleteAllOutputs();
      },
    },
  ],
];

export const handleStuckOutputs = async (db: IDBWrapper): Promise<void> => {
  try {
    const loadingOutputs: Output[] = await getLoadingOutputs(db);
    for (const loadingOutput of loadingOutputs) {
      await updateOutput(db, loadingOutput.OutputID, {
        Loading: false,
        Error: { message: DICTIONARY.placeholders.failedLoadingOutput },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const readAndSetOutputs = (
  db: IDBWrapper,
  selectedEntityId: string,
  dispatch: AppDispatch
): void => {
  getOutputsByChainId(db, selectedEntityId)
    .then((outputs: Output[]) => {
      dispatch(setOutputs({ chainId: selectedEntityId, outputs }));
    })
    .catch((error) => {
      console.error(error);
    });
};

export const readAndSetWorkflowOutputs = (
  db: IDBWrapper,
  selectedEntityId: string,
  dispatch: AppDispatch
): void => {
  getWorkflowOutputsByWorkflowId(db, selectedEntityId)
    .then((workflowOutputs: WorkflowOutput[]) => {
      dispatch(
        setWorkflowOutputs({ workflowId: selectedEntityId, workflowOutputs })
      );
    })
    .catch((error) => {
      console.error(error);
    });
};
