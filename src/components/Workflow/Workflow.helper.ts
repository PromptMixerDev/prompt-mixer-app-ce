import { v4 as uuidv4 } from 'uuid';
import {
  type IDBWrapper,
  getWorkflowById,
  getPromptChainById,
  getVariablesByChainId,
  type Variable,
  updateVariable,
  type PromptChain,
  type WorkflowOutputData,
  type Workflow,
  type WorkflowOutput,
  createOrUpdateWorkflowOutput,
  type OutputData,
  type WorkflowCompletion,
  getChainModels,
  getPromptsByChainId,
  getWorkflowOutputById,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import { type PromptItemType } from 'store/prompts/promptsSlice';
import { type IWorkflow, addWorkflow } from 'store/workflow/workflowSlice';
import {
  addRunningModel,
  removeRunningModel,
  type ModelType,
} from 'store/model/modelSlice';
import {
  addOrUpdateWorkflowOutput,
  updateWorkflowOutput,
} from 'store/workflowOutputs/workflowOutputsSlice';
import {
  processDatasets,
  processModel,
  processPrompts,
  readAndSetVariables,
} from '../PromptEditor/PromptEditor.helper';

export const readAndSetWorkflow = (
  db: IDBWrapper,
  workflowId: string,
  dispatch: AppDispatch
): void => {
  getWorkflowById(db, workflowId)
    .then(async (workflow: Workflow) => {
      try {
        const chains = (
          await Promise.all(
            workflow.Chains.map(async (chainId) => {
              const chain = await getPromptChainById(db, chainId);
              return chain;
            })
          )
        ).filter(Boolean);
        dispatch(addWorkflow({ ...workflow, Chains: chains }));
      } catch (error) {
        console.error(error);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const handleAddedChainVariables = async (
  db: IDBWrapper,
  workflowId: string,
  chainId: string,
  variables: Variable[],
  dispatch: AppDispatch
): Promise<void> => {
  const chainVariables = await getVariablesByChainId(db, chainId);
  try {
    await Promise.all(
      chainVariables.map(async (chainVariable) => {
        const value = variables.find(
          (variable) => chainVariable.Name === variable.Name
        )?.Value;
        if (value) {
          await updateVariable(db, chainVariable.VariableID, {
            WorkflowValues: {
              ...chainVariable.WorkflowValues,
              [workflowId]: value,
            },
          });
        }
      })
    );
    readAndSetVariables(db, chainId, dispatch);
  } catch (error) {
    console.error(error);
  }
};

export const processRemovedChainVariables = (
  db: IDBWrapper,
  workflowId: string,
  chainId: string,
  variables: Variable[],
  dispatch: AppDispatch
): void => {
  const variablesToUpdate = variables.filter(
    (variable) => variable.ChainID === chainId
  );
  variablesToUpdate.forEach((variable) => {
    updateVariable(db, variable.VariableID, {
      WorkflowValues: { ...variable.WorkflowValues, [workflowId]: undefined },
    })
      .then(() => {
        readAndSetVariables(db, variable.ChainID, dispatch);
      })
      .catch((error) => console.error(error));
  });
};

export const isRunButtonDisabled = (
  workflowId: string,
  models: Record<string, ModelType | undefined>,
  promptItems: Record<string, PromptItemType[]>,
  runningModels: Record<string, string[]>
): boolean =>
  !Object.values(models).every((model) => model?.Model) ||
  Object.values(promptItems)
    .flat()
    .some((promptItem) => 'Default' in promptItem) ||
  !!runningModels[workflowId]?.length;

export const processVariables = (
  db: IDBWrapper,
  workflowId: string,
  variables: Variable[],
  dispatch: AppDispatch
): void => {
  variables.forEach((variable) => {
    if (!variable.Value) {
      const value = variables.find(
        (el) =>
          el.Name === variable.Name &&
          el.Value &&
          (el.UpdatedAt ?? el.CreatedAt) >
            (variable.UpdatedAt ?? variable.CreatedAt)
      )?.Value;
      if (value) {
        updateVariable(db, variable.VariableID, {
          WorkflowValues: { ...variable.WorkflowValues, [workflowId]: value },
        })
          .then(() => {
            readAndSetVariables(db, variable.ChainID, dispatch);
          })
          .catch((error) => console.error(error));
      }
    }
  });
};

const getNewWorkflowOutputData = (
  ouptutId: string,
  workflowId: string,
  chain: PromptChain,
  selectedModel: ModelType,
  existingWorkflowOutput?: WorkflowOutput
): WorkflowOutputData => ({
  ...existingWorkflowOutput,
  OutputID: ouptutId,
  WorkflowID: workflowId,
  Completions: [
    ...(existingWorkflowOutput?.Completions ?? []),
    {
      Content: null,
      ModelType: selectedModel.Model!,
      ConnectorName: selectedModel.ConnectorName,
      Properties: selectedModel.Properties,
      ChainName: chain.Title,
      ChainID: chain.ChainID,
      Error: undefined,
      TokenUsage: undefined,
    },
  ],
  Loading: true,
});

export const handleRunWorkflow = async ({
  db,
  workflowId,
  chain,
  promptItems,
  model,
  dispatch,
  send,
  variables,
  workflow,
  existingWorkflowOutput,
}: {
  db: IDBWrapper;
  workflowId: string;
  chain: PromptChain;
  promptItems: PromptItemType[];
  model: ModelType;
  dispatch: AppDispatch;
  send: (channel: string, ...args: any[]) => void;
  variables: Variable[];
  workflow: IWorkflow;
  existingWorkflowOutput?: WorkflowOutput;
}): Promise<void> => {
  try {
    const { promptContents, selectedModels, maxDataLength, datasets } =
      await processPrompts(db, promptItems, variables, [model]);
    const context = existingWorkflowOutput?.Completions?.slice(-1)[0].Content;
    const selectedModel = selectedModels[0];
    const { properties, settings } = await processModel(db, selectedModel);

    for (let i = 0; i < maxDataLength; i++) {
      const replacedPromptContents = processDatasets(
        promptContents,
        datasets,
        i
      );
      const prompts = context
        ? [context, ...replacedPromptContents]
        : replacedPromptContents;

      const ouptutId =
        existingWorkflowOutput && i === 0
          ? existingWorkflowOutput.OutputID
          : uuidv4();
      const workflowOutput: WorkflowOutput = await createOrUpdateWorkflowOutput(
        db,
        getNewWorkflowOutputData(
          ouptutId,
          workflowId,
          chain,
          selectedModel,
          existingWorkflowOutput
        )
      );

      dispatch(
        addRunningModel({
          id: workflowId,
          model: selectedModel.Model!,
        })
      );
      dispatch(
        addOrUpdateWorkflowOutput({
          workflowId,
          workflowOutput: {
            ...workflowOutput,
            activeStep: workflowOutput.Completions.length - 1,
          },
        })
      );
      send(
        'run-connector-script',
        selectedModel,
        prompts,
        properties,
        settings,
        workflowOutput.OutputID,
        workflow
      );
    }
  } catch (error) {
    console.error(error);
  }
};

const getNextChain = (
  chainId: string,
  chains: PromptChain[]
): PromptChain | null => {
  const index = chains.findIndex((el) => el.ChainID === chainId);

  if (index !== -1) {
    return chains[index + 1] ?? null;
  }
  return null;
};

export const handleWorkflowOutput = async (
  db: IDBWrapper,
  outputId: string,
  model: string,
  value: Partial<OutputData>,
  workflow: IWorkflow,
  dispatch: AppDispatch,
  send: (channel: string, ...args: any[]) => void
): Promise<void> => {
  const output = await getWorkflowOutputById(db, outputId);
  const chainFinalCompletions = value.Completions?.pop() as WorkflowCompletion;
  const lastCompletion: WorkflowCompletion = chainFinalCompletions && {
    ...output.Completions.pop()!,
    Content: chainFinalCompletions?.Content ?? '',
    Error: chainFinalCompletions?.Error,
    TokenUsage: chainFinalCompletions?.TokenUsage,
  };
  const completions = [...output.Completions, lastCompletion].filter(Boolean);
  const nextChain = lastCompletion
    ? getNextChain(lastCompletion.ChainID, workflow.Chains)
    : null;
  const updatedOutput: WorkflowOutput = {
    ...output,
    Completions: completions,
    Error: value.Error,
    Loading: !!nextChain,
  };
  const workflowOutput = await createOrUpdateWorkflowOutput(db, updatedOutput);
  dispatch(
    updateWorkflowOutput({
      workflowId: workflowOutput.WorkflowID,
      id: outputId,
      workflowOutput,
    })
  );
  dispatch(removeRunningModel({ id: output.WorkflowID, model }));
  if (nextChain) {
    const nextChainId = nextChain.ChainID;
    const promptItems = await getPromptsByChainId(db, nextChainId);
    const models = await getChainModels(db, nextChainId);
    const variables = await getVariablesByChainId(db, nextChainId);

    await handleRunWorkflow({
      db,
      workflowId: workflow.WorkflowID,
      chain: nextChain,
      promptItems,
      model: models.find((model) => model.Model)!,
      dispatch,
      send,
      variables: variables.map((variable) => ({
        ...variable,
        Value: variable.WorkflowValues?.[workflow.WorkflowID],
      })),
      workflow,
      existingWorkflowOutput: updatedOutput,
    });
  }
};
