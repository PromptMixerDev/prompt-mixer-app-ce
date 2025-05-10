import { v4 as uuidv4 } from 'uuid';
import { type Model } from 'flexlayout-react';
import {
  getChainModels,
  type ChainModel,
  createOrUpdateChainModel,
  type IDBWrapper,
  getPromptsByChainId,
  type OutputData,
  createNewChain,
  getConnectorSettings,
  saveOutput,
  type Output,
  type Property,
  type Dataset,
  getDatasetById,
  type Variable,
  getVariablesByChainId,
  getAIToolsByChainId,
  type AITool,
  addAIToolToChain,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import {
  EntityType,
  setSelectedEntity,
} from 'store/selectedEntity/selectedEntitySlice';
import {
  type ModelType,
  addRunningModel,
  setModelsByChainId,
} from 'store/model/modelSlice';
import { addOutput, updateOutputFilters } from 'store/outputs/outputsSlice';
import {
  type PromptItemType,
  addPromptItems,
} from 'store/prompts/promptsSlice';
import { addVariables } from 'store/variables/variablesSlice';
import { addAITools } from 'store/aiTools/aiToolsSlice';
import { type IModel } from '../ModelsSelector';
import { type DefaultPromptItem, type IPromptItem } from './PromptEditor';
import { getTree } from '../Tree/Tree.helper';
import {
  OUTPUTS_TAB_SET_ID,
  TabSetOrder,
  tabMap,
} from '../FlexLayout/FlexLayout.config';
import {
  normalizeProperties,
  normalizeSettings,
} from '../ModelsSelector/ModelsSelector.helper';
import {
  addNewTabsHandler,
  updateTabAttributes,
} from '../FlexLayout/FlexLayout.helper';
import {
  extractVariableName,
  variablePatternGlobal,
} from './EditorArea/EditorArea.helper';
import { IAITool } from '../AITools';

export const getDefaultModel = (chainId?: string): IModel => ({
  ChainModelID: uuidv4(),
  ChainID: chainId,
  Order: 0,
});

export const getDefaultPrompt = (chainId?: string): DefaultPromptItem => {
  const versionId = uuidv4();
  return {
    PromptID: uuidv4(),
    ChainID: chainId,
    Enabled: true,
    VersionID: versionId,
    ActiveVersionID: versionId,
    VersionNumber: 1,
    Content: '',
    Default: true,
  };
};

export const isRunButtonDisabled = (
  chainId: string | undefined,
  models: ModelType[],
  promptItems: PromptItemType[],
  runningModels: Record<string, string[]>
): boolean =>
  !models.length ||
  !models.some((model) => model.Model) ||
  !promptItems.length ||
  'Default' in promptItems[0] ||
  !!(chainId && runningModels[chainId]?.length);

export const readAndSetChainModels = (
  db: IDBWrapper,
  chainId: string,
  dispatch: AppDispatch
): void => {
  getChainModels(db, chainId)
    .then((chainModels: ChainModel[]) => {
      if (chainModels.length) {
        dispatch(setModelsByChainId({ chainId, models: chainModels }));
      } else {
        const defaultModel = getDefaultModel(chainId);
        createOrUpdateChainModel(db, defaultModel as ChainModel)
          .then(() =>
            dispatch(
              setModelsByChainId({
                chainId,
                models: [defaultModel],
              })
            )
          )
          .catch((error) => {
            console.error(error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const readAndSetPrompts = (
  db: IDBWrapper,
  chainId: string,
  dispatch: AppDispatch
): void => {
  getPromptsByChainId(db, chainId)
    .then((prompts: IPromptItem[]) => {
      if (prompts.length) {
        dispatch(addPromptItems({ chainId, promptItems: prompts }));
      } else {
        dispatch(
          addPromptItems({ chainId, promptItems: [getDefaultPrompt(chainId)] })
        );
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export const createModels = (
  db: IDBWrapper,
  models: IModel[],
  chainId: string
): void =>
  models
    .map((model) => ({ ...model, ChainID: chainId }))
    .forEach((model) => {
      createOrUpdateChainModel(db, model as ChainModel).catch((error) => {
        console.error(error);
      });
    });

const getNewOutputData = (
  chainId: string,
  model: string,
  promptVersions: Array<[number, number]>,
  properties: Property[] | undefined,
  connectorName: string | undefined
): OutputData => ({
  ChainID: chainId,
  Completions: [],
  ModelType: model,
  PromptVersions: promptVersions,
  Loading: true,
  Properties: properties,
  ConnectorName: connectorName,
});

export const createAndSetChain = async (
  db: IDBWrapper,
  tabId: string,
  models: Array<ChainModel | IModel>,
  aiTools: IAITool[],
  flexLayoutModel: Model,
  dispatch: AppDispatch
): Promise<void> =>
  await createNewChain(db, { ChainID: tabId })
    .then((chainId) => {
      createModels(db, models, chainId);
      createAITools(db, aiTools, chainId);
      updateTabAttributes(
        chainId,
        {
          config: { chainId },
        },
        flexLayoutModel
      );
      getTree(db, dispatch);
      dispatch(
        setSelectedEntity({
          selectedEntityId: chainId as string | undefined,
          selectedEntityType: EntityType.promptChain,
        })
      );
    })
    .catch((error) => {
      console.error(error);
    });

const datasetLinkRegex = /\[\[([^[\]]+?)(?:\.([^[\].]+))?\]\]\(([^)]*)\)/g;

const getDatasetValue = (
  dataset: Dataset,
  key: string,
  index: number
): string => {
  if (!dataset?.Data?.length) return '';

  const dataItem =
    index < dataset?.Data?.length ? dataset.Data?.[index] : dataset.Data?.[0];

  if (!dataItem || typeof dataItem !== 'object') {
    return '';
  }

  const value = dataset.Headers?.includes(key)
    ? dataItem[key]
    : dataItem[dataset.Headers?.[0] ?? ''];

  return value ?? '';
};

export const openOutputTab = (model: Model, dispatch: AppDispatch): void =>
  addNewTabsHandler(
    [
      {
        tabNodeJson: tabMap.outputTab,
        tabSetId: OUTPUTS_TAB_SET_ID,
        tabSetOrder: TabSetOrder.outputs,
      },
    ],
    model,
    dispatch
  );

export const processPrompts = async (
  db: IDBWrapper,
  promptItems: PromptItemType[],
  variables: Variable[],
  models: ModelType[]
): Promise<{
  promptContents: string[];
  promptVersions: Array<[number, number]>;
  selectedModels: ModelType[];
  maxDataLength: number;
  datasets: Record<string, Dataset>;
}> => {
  const promptContents = promptItems
    .filter((item) => item.Enabled)
    .map((item) =>
      item.Content.replace(variablePatternGlobal, (match: string) => {
        const variableName = extractVariableName(match);
        const value =
          variables.find((variable) => variable.Name === variableName)?.Value ??
          '';
        return value;
      })
    );
  const promptVersions = promptItems
    .map((item, index) => item.Enabled && [index + 1, item.VersionNumber])
    .filter(Boolean) as Array<[number, number]>;
  const selectedModels = models.filter((item) => item.Model);
  const datasets: Record<string, Dataset> = {};
  const datasetLinks = promptContents.flatMap((content) => [
    ...content.matchAll(datasetLinkRegex),
  ]);

  for (const [, , , datasetId] of datasetLinks) {
    if (!datasets[datasetId]) {
      datasets[datasetId] = await getDatasetById(db, datasetId);
    }
  }

  const maxDataLength = Math.max(
    ...Object.values(datasets).map((dataset) => dataset?.Data?.length ?? 1),
    1
  );

  return {
    promptContents,
    promptVersions,
    selectedModels,
    maxDataLength,
    datasets,
  };
};

export const processModel = async (
  db: IDBWrapper,
  selectedModel: ModelType,
  aiTools?: IAITool[]
): Promise<{
  properties: Record<string, unknown>;
  settings: Record<string, unknown>;
}> => {
  const properties: Record<string, unknown> = selectedModel.Properties
    ? normalizeProperties(selectedModel.Properties)
    : {};

  const tools = aiTools
    ?.map((aiTool) => {
      try {
        return JSON.parse(aiTool.Value!);
      } catch (error) {
        console.error(error);
        return null;
      }
    })
    ?.filter(Boolean);

  const connectorSettings = await getConnectorSettings(
    db,
    selectedModel.ConnectorFolder!
  );
  const settings: Record<string, unknown> = connectorSettings
    ? normalizeSettings(connectorSettings.Settings)
    : {};

  const mcpConfig = tools?.[0];
  return {
    properties: {
      ...properties,
      tools: mcpConfig,
    },
    settings,
  };
};

export const processDatasets = (
  promptContents: string[],
  datasets: Record<string, Dataset>,
  rowNumber: number
): string[] =>
  promptContents.map((content) =>
    content.replace(datasetLinkRegex, (match, title, key, datasetId) => {
      const dataset = datasets[datasetId];
      const value = getDatasetValue(dataset, key as string, rowNumber);
      return value;
    })
  );

export const handleRunModel = async ({
  db,
  promptItems,
  chainId,
  models,
  dispatch,
  send,
  variables,
  aiTools,
  flexLayoutModel,
}: {
  db: IDBWrapper;
  promptItems: PromptItemType[];
  chainId: string | undefined;
  models: ModelType[];
  dispatch: AppDispatch;
  send: (channel: string, ...args: any[]) => void;
  variables: Variable[];
  aiTools: IAITool[];
  flexLayoutModel: Model;
}): Promise<void> => {
  try {
    if (promptItems.length && chainId) {
      const {
        promptContents,
        promptVersions,
        selectedModels,
        maxDataLength,
        datasets,
      } = await processPrompts(db, promptItems, variables, models);

      for (const selectedModel of selectedModels) {
        const { properties, settings } = await processModel(
          db,
          selectedModel,
          aiTools
        );

        for (let i = 0; i < maxDataLength; i++) {
          const replacedPromptContents = processDatasets(
            promptContents,
            datasets,
            i
          );

          dispatch(
            addRunningModel({
              id: chainId,
              model: selectedModel.Model!,
            })
          );
          const output: Output = await saveOutput(
            db,
            getNewOutputData(
              chainId,
              selectedModel.Model!,
              promptVersions,
              selectedModel.Properties,
              selectedModel.ConnectorName
            )
          );
          dispatch(addOutput({ chainId, output }));
          dispatch(updateOutputFilters({ chainId }));
          send(
            'run-connector-script',
            selectedModel,
            replacedPromptContents,
            properties,
            settings,
            output.OutputID
          );
        }
      }

      openOutputTab(flexLayoutModel, dispatch);
    }
  } catch (error) {
    console.error(error);
  }
};

export const readAndSetVariables = (
  db: IDBWrapper,
  chainId: string,
  dispatch: AppDispatch
): void => {
  getVariablesByChainId(db, chainId)
    .then((variables: Variable[]) => {
      dispatch(addVariables({ chainId, variables }));
    })
    .catch((error) => {
      console.error(error);
    });
};

export const readAndSetAITools = (
  db: IDBWrapper,
  chainId: string,
  dispatch: AppDispatch
): void => {
  getAIToolsByChainId(db, chainId)
    .then((aiTools: AITool[]) => {
      dispatch(addAITools({ chainId, aiTools }));
    })
    .catch((error) => {
      console.error(error);
    });
};

export const createAITools = (
  db: IDBWrapper,
  aiTools: IAITool[],
  chainId: string
): void =>
  aiTools
    .map((aiTool) => ({ ...aiTool, ChainID: chainId }))
    .forEach((aiTool) => {
      addAIToolToChain(db, aiTool).catch((error) => {
        console.error(error);
      });
    });
