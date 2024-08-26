import { type OutputType } from 'store/outputs/outputsSlice';
import { type WorkflowOutputType } from 'store/workflowOutputs/workflowOutputsSlice';

export const downloadJsonFile = (
  data: OutputType[] | WorkflowOutputType[],
  filename: string = 'data.json'
): void => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data)
  )}`;

  const link = document.createElement('a');
  link.href = jsonString;

  link.download = filename;
  link.click();
  link.remove();
};
