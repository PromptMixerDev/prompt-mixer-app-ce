import {
  type IDBWrapper,
  type OutputData,
  updateOutput,
  type Output,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import { removeRunningModel } from 'store/model/modelSlice';
import {
  type OutputType,
  updateOutput as updateReduxOutput,
} from 'store/outputs/outputsSlice';
import { type WorkflowOutputType } from 'store/workflowOutputs/workflowOutputsSlice';

export const getCompletionTime = (
  output: OutputType | WorkflowOutputType
): string | null => {
  if (output.CreatedAt && output.CompletedAt) {
    const start = new Date(output.CreatedAt);
    const end = new Date(output.CompletedAt);
    const differenceMilliseconds = end.getTime() - start.getTime();
    const differenceSeconds = differenceMilliseconds / 1000;
    return `${differenceSeconds.toFixed(2)}s`;
  }
  return null;
};

export const handleUpdateOutput = (
  db: IDBWrapper,
  outputId: string,
  model: string,
  value: Partial<OutputData>,
  dispatch: AppDispatch
): void => {
  updateOutput(db, outputId, {
    ...value,
    Loading: false,
    CompletedAt: new Date(),
  })
    .then((output: Output) => {
      dispatch(
        updateReduxOutput({ chainId: output.ChainID, id: outputId, output })
      );
      dispatch(removeRunningModel({ id: output.ChainID, model }));
    })
    .catch((error) => {
      console.error(error);
    });
};
