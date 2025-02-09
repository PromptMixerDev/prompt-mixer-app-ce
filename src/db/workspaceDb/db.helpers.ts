import { v4 as uuidv4 } from 'uuid';
import sortBy from 'lodash/sortBy';
import isEqual from 'lodash/isEqual';
import { DICTIONARY } from 'dictionary';
import {
  type ChainCollection,
  DBStores,
  type PromptChain,
  type IDBWrapper,
  DBKeyPathes,
  type Prompt,
  type PromptVersion,
  type Completion,
  type Output,
  type ChainModel,
  type ConnectorSettings,
  type ConnectorSetting,
  type Property,
  type Dataset,
  type Variable,
  type Workflow,
  type WorkflowOutput,
  type WorkflowCompletion,
} from 'db/workspaceDb';
import { hashObject } from 'utils';
import { type IPromptItem } from 'components/PromptEditor';

const isChanged = <T>(oldValues: T, newValues: Partial<T>): boolean => {
  const keys = Object.keys(newValues) as Array<keyof T>;
  return keys.some((key) => !isEqual(oldValues[key], newValues[key]));
};

export const createNewChain = async (
  db: IDBWrapper,
  chain?: Partial<PromptChain>
): Promise<string> => {
  const date = new Date();
  const newChain: PromptChain = {
    ChainID: uuidv4(),
    Title: DICTIONARY.labels.untitled,
    Prompts: [],
    ...chain,
    CreatedAt: date,
    UpdatedAt: date,
  };
  await db.add(DBStores.promptChain, newChain);

  return newChain.ChainID;
};

export const createNewCollection = async (db: IDBWrapper): Promise<string> => {
  const date = new Date();
  const newCollection: ChainCollection = {
    CollectionID: uuidv4(),
    Title: DICTIONARY.labels.untitled,
    Description: '',
    CreatedAt: date,
    UpdatedAt: date,
  };
  await db.add(DBStores.chainCollection, newCollection);

  return newCollection.CollectionID;
};

export const getChainCollections = async (
  db: IDBWrapper
): Promise<ChainCollection[]> => {
  const res = (await db.getAll(DBStores.chainCollection)) as ChainCollection[];
  return res;
};

export const getPromptChainById = async (
  db: IDBWrapper,
  id: string
): Promise<PromptChain> => {
  const chain = (await db.get(DBStores.promptChain, id)) as PromptChain;
  return chain;
};

export const getPromptById = async (
  db: IDBWrapper,
  id: string
): Promise<Prompt> => {
  const prompt = (await db.get(DBStores.prompt, id)) as Prompt;
  return prompt;
};

type PromptItem = Prompt & PromptVersion;

export const getPromptsByChainId = async (
  db: IDBWrapper,
  chainId: string
): Promise<PromptItem[]> => {
  if (!chainId) return [];

  const chain = (await db.get(DBStores.promptChain, chainId)) as PromptChain;
  const promptItems: PromptItem[] = [];

  for (const promptId of chain.Prompts) {
    const prompt = (await db.get(DBStores.prompt, promptId)) as Prompt;
    if (!prompt) {
      continue;
    }
    const activeVersion = (await db.get(
      DBStores.promptVersion,
      prompt.ActiveVersionID
    )) as PromptVersion;
    if (activeVersion) {
      promptItems.push({
        ...prompt,
        ...activeVersion,
      });
    }
  }
  return promptItems;
};

export const addPromptVersion = async (
  db: IDBWrapper,
  id: string,
  text: string,
  versionNumber: number
): Promise<PromptVersion> => {
  const date = new Date();
  const versionId = uuidv4();
  const promptVersion: PromptVersion = {
    VersionID: versionId,
    PromptID: id,
    VersionNumber: versionNumber,
    Content: text,
    CreatedAt: date,
    UpdatedAt: date,
  };
  await db.add(DBStores.promptVersion, promptVersion);

  await updatePrompt(db, id, { ActiveVersionID: versionId });
  return promptVersion;
};

export const updatePrompt = async (
  db: IDBWrapper,
  id: string,
  values: Partial<Prompt>
): Promise<void> => {
  const promptToUpdate = (await db.get(DBStores.prompt, id)) as PromptVersion;
  if (isChanged(promptToUpdate, values)) {
    await db.update(DBStores.prompt, {
      ...promptToUpdate,
      ...values,
      UpdatedAt: new Date(),
    });
  }
};

const updatePromptVersion = async (
  db: IDBWrapper,
  id: string,
  text: string
): Promise<void> => {
  const promptVersion = (await db.get(
    DBStores.promptVersion,
    id
  )) as PromptVersion;
  if (isChanged(promptVersion, { Content: text })) {
    await db.update(DBStores.promptVersion, {
      ...promptVersion,
      Content: text,
      UpdatedAt: new Date(),
    });
  }
};

const deletePromptAndPromptVersions = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  const promptVersionsToDelete = (await db.getAllFromIndex(
    DBStores.promptVersion,
    DBKeyPathes.promptID,
    id
  )) as PromptVersion[];

  await Promise.all(
    promptVersionsToDelete.map(async (promptVersion) => {
      await db.delete(DBStores.promptVersion, promptVersion.VersionID);
    })
  );
  await db.delete(DBStores.prompt, id);
};

export const getPromptVersionsById = async (
  db: IDBWrapper,
  id: string
): Promise<PromptVersion[]> => {
  const promptVersions = (await db.getAllFromIndex(
    DBStores.promptVersion,
    DBKeyPathes.promptID,
    id
  )) as PromptVersion[];

  return promptVersions.toSorted((a, b) => b.VersionNumber - a.VersionNumber);
};

export const createOrUpdatePrompt = async (
  db: IDBWrapper,
  prompt: Omit<IPromptItem, 'CreatedAt'>
): Promise<void> => {
  const existingPrompt = await db.get(DBStores.prompt, prompt.PromptID);

  if (existingPrompt) {
    await updatePrompt(db, prompt.PromptID, { Enabled: prompt.Enabled });
    await updatePromptVersion(db, prompt.VersionID, prompt.Content);
  }

  if (!existingPrompt) {
    const date = new Date();
    await db.add(DBStores.prompt, {
      PromptID: prompt.PromptID,
      ChainID: prompt.ChainID,
      Enabled: prompt.Enabled,
      ActiveVersionID: prompt.ActiveVersionID,
      CreatedAt: date,
      UpdatedAt: date,
    });
    await db.add(DBStores.promptVersion, {
      VersionID: prompt.VersionID,
      PromptID: prompt.PromptID,
      VersionNumber: prompt.VersionNumber,
      Content: prompt.Content,
      CreatedAt: date,
      UpdatedAt: date,
    });
  }
};

export enum TreeEntityTypes {
  COLLECTION = 'collection',
  CHAIN = 'chain',
  DATASET = 'dataset',
  WORKFLOW = 'workflow',
}
export interface TreeItem {
  id: string;
  label: string;
  entityType: TreeEntityTypes;
  children?: TreeItem[];
  collectionId?: string;
}

const TITLE_FIELD = 'Title';

export const getTreeData = async (db: IDBWrapper): Promise<TreeItem[]> => {
  const collections = (await db.getAll(
    DBStores.chainCollection
  )) as ChainCollection[];
  const chains = (await db.getAll(DBStores.promptChain)) as PromptChain[];
  const chainsWithoutCollections: PromptChain[] = chains.filter(
    (chain) => !chain.CollectionID
  );

  const datasets = (await db.getAll(DBStores.dataset)) as Dataset[];
  const datasetsWithoutCollections: Dataset[] = datasets.filter(
    (dataset) => !dataset.CollectionID
  );

  const workflows = (await db.getAll(DBStores.workflow)) as Workflow[];
  const workflowsWithoutCollections: Workflow[] = workflows.filter(
    (workflow) => !workflow.CollectionID
  );

  const tree = await Promise.all(
    collections.map(async (collection) => {
      const chains = (await db.getAllFromIndex(
        DBStores.promptChain,
        DBKeyPathes.collectionID,
        collection.CollectionID
      )) as PromptChain[];
      const chainChildren = sortBy(chains, TITLE_FIELD).map((chain) => ({
        id: chain.ChainID,
        label: chain.Title,
        entityType: TreeEntityTypes.CHAIN,
        collectionId: chain.CollectionID,
      }));

      const datasets = (await db.getAllFromIndex(
        DBStores.dataset,
        DBKeyPathes.collectionID,
        collection.CollectionID
      )) as Dataset[];
      const datasetChildren = sortBy(datasets, TITLE_FIELD).map((dataset) => ({
        id: dataset.DatasetID,
        label: dataset.Title,
        entityType: TreeEntityTypes.DATASET,
        collectionId: dataset.CollectionID,
      }));

      const workflows = (await db.getAllFromIndex(
        DBStores.workflow,
        DBKeyPathes.collectionID,
        collection.CollectionID
      )) as Workflow[];
      const workflowChildren = sortBy(workflows, TITLE_FIELD).map(
        (workflow) => ({
          id: workflow.WorkflowID,
          label: workflow.Title,
          entityType: TreeEntityTypes.WORKFLOW,
          collectionId: workflow.CollectionID,
        })
      );

      return {
        id: collection.CollectionID,
        label: collection.Title,
        entityType: TreeEntityTypes.COLLECTION,
        children: [...chainChildren, ...datasetChildren, ...workflowChildren],
      };
    })
  );

  sortBy(chainsWithoutCollections, TITLE_FIELD).forEach((chain) => {
    tree.push({
      id: chain.ChainID,
      label: chain.Title,
      entityType: TreeEntityTypes.CHAIN,
      children: [],
    });
  });

  sortBy(datasetsWithoutCollections, TITLE_FIELD).forEach((dataset) => {
    tree.push({
      id: dataset.DatasetID,
      label: dataset.Title,
      entityType: TreeEntityTypes.DATASET,
      children: [],
    });
  });

  sortBy(workflowsWithoutCollections, TITLE_FIELD).forEach((workflow) => {
    tree.push({
      id: workflow.WorkflowID,
      label: workflow.Title,
      entityType: TreeEntityTypes.WORKFLOW,
      children: [],
    });
  });

  return tree;
};

export const updatePromptChain = async (
  db: IDBWrapper,
  id: string,
  newValues: Partial<PromptChain>
): Promise<void> => {
  const promptChainToUpdate = (await db.get(
    DBStores.promptChain,
    id
  )) as PromptChain;
  if (isChanged(promptChainToUpdate, newValues)) {
    await db.update(DBStores.promptChain, {
      ...promptChainToUpdate,
      ...newValues,
      UpdatedAt: new Date(),
    });
  }
};

const duplicatePrompt = async (
  db: IDBWrapper,
  id: string,
  chainId: string
): Promise<string> => {
  const prompt = (await db.get(DBStores.prompt, id)) as Prompt;
  const activeVersion = (await db.get(
    DBStores.promptVersion,
    prompt.ActiveVersionID
  )) as PromptVersion;

  const newPromptId = uuidv4();
  const newPromptVersionId = uuidv4();
  await createOrUpdatePrompt(db, {
    PromptID: newPromptId,
    ChainID: chainId,
    Enabled: prompt.Enabled,
    ActiveVersionID: newPromptVersionId,
    VersionID: newPromptVersionId,
    VersionNumber: 1,
    Content: activeVersion.Content,
  });

  return newPromptId;
};

export const duplicatePromptChain = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  const promptChain = (await db.get(DBStores.promptChain, id)) as PromptChain;
  const newChainId = await createNewChain(db, {
    Title: `${promptChain.Title} copy`,
    CollectionID: promptChain.CollectionID,
  });
  if (promptChain.Prompts) {
    const newPrompts: string[] = [];
    for (const promptId of promptChain.Prompts) {
      const newPromptId = await duplicatePrompt(db, promptId, newChainId);
      newPrompts.push(newPromptId);
    }
    await updatePromptChain(db, newChainId, { Prompts: newPrompts });
  }
};

export const updateChainCollection = async (
  db: IDBWrapper,
  id: string,
  newValues: { Title?: string }
): Promise<void> => {
  const chainCollectionToUpdate = (await db.get(
    DBStores.chainCollection,
    id
  )) as ChainCollection;

  await db.update(DBStores.chainCollection, {
    ...chainCollectionToUpdate,
    ...newValues,
    UpdatedAt: new Date(),
  });
};

export const deletePromptChain = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  const prompts = (await db.getAllFromIndex(
    DBStores.prompt,
    DBKeyPathes.chainID,
    id
  )) as Prompt[];
  await Promise.all(
    prompts.map(async (prompt) => {
      await deletePromptAndPromptVersions(db, prompt.PromptID);
    })
  );

  await deleteAllOutputs(db, id);
  await deleteAllVariables(db, id);

  const models = await getChainModels(db, id);
  await Promise.all(
    models.map(async (model) => {
      await deleteChainModel(db, model.ChainModelID);
    })
  );

  await db.delete(DBStores.promptChain, id);
};

export const deleteChainCollection = async (
  db: IDBWrapper,
  id: string
): Promise<string[]> => {
  const chainsToDelete = (await db.getAllFromIndex(
    DBStores.promptChain,
    DBKeyPathes.collectionID,
    id
  )) as PromptChain[];
  const chainIds = await Promise.all(
    chainsToDelete.map(async (chain) => {
      await deletePromptChain(db, chain.ChainID);
      return chain.ChainID;
    })
  );

  const datasetsToDelete = (await db.getAllFromIndex(
    DBStores.dataset,
    DBKeyPathes.collectionID,
    id
  )) as Dataset[];
  const datasetIds = await Promise.all(
    datasetsToDelete.map(async (dataset) => {
      await deleteDataset(db, dataset.DatasetID);
      return dataset.DatasetID;
    })
  );

  await db.delete(DBStores.chainCollection, id);
  return [...chainIds, ...datasetIds];
};

export interface OutputData {
  ChainID: string;
  Completions: Completion[];
  ModelType: string;
  ConnectorName?: string;
  PromptVersions: Array<[number, number]>;
  Error?: any;
  Loading?: boolean;
  Properties?: Property[];
  CompletedAt?: Date;
  Like?: boolean;
  Dislike?: boolean;
}

export const saveOutput = async (
  db: IDBWrapper,
  outputData: OutputData
): Promise<Output> => {
  const date = new Date();
  const OutputID = uuidv4();
  const newOutputData = {
    OutputID,
    ...outputData,
    CreatedAt: date,
    UpdatedAt: date,
  };
  const hash = await hashObject(newOutputData);
  const newOutput = { ...newOutputData, Hash: hash };
  await db.add(DBStores.output, newOutput);
  return newOutput;
};

export const getOutputsByChainId = async (
  db: IDBWrapper,
  chainId: string
): Promise<Output[]> => {
  const outputs = (await db.getAllFromIndex(
    DBStores.output,
    DBKeyPathes.chainID,
    chainId
  )) as Output[];
  return outputs.toSorted((a, b) => (a.CreatedAt < b.CreatedAt ? 1 : -1));
};

export const updateOutput = async (
  db: IDBWrapper,
  id: string,
  outputData: Partial<OutputData>
): Promise<Output> => {
  const output = (await db.get(DBStores.output, id)) as Output;
  const updatedOutput = {
    ...output,
    ...outputData,
    Error: outputData.Error
      ? (outputData.Error?.message ?? JSON.stringify(outputData.Error))
      : output.Error,
    UpdatedAt: new Date(),
  };
  const hash = await hashObject(updatedOutput);
  updatedOutput.Hash = hash;
  await db.update(DBStores.output, updatedOutput);
  return updatedOutput;
};
export const getLoadingOutputs = async (db: IDBWrapper): Promise<Output[]> => {
  const outputs = (await db.getAll(DBStores.output)) as Output[];
  return outputs.filter((output) => output.Loading);
};

export const deleteOutput = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  await db.delete(DBStores.output, id);
};

export interface WorkflowOutputData {
  OutputID?: string;
  WorkflowID: string;
  Completions: WorkflowCompletion[];
  Error?: any;
  Loading?: boolean;
  CompletedAt?: Date;
  Like?: boolean;
  Dislike?: boolean;
}

export const getWorkflowOutputById = async (
  db: IDBWrapper,
  id: string
): Promise<WorkflowOutput> => {
  const workflowOutput = (await db.get(
    DBStores.workflowOutput,
    id
  )) as WorkflowOutput;
  return workflowOutput;
};

export const createOrUpdateWorkflowOutput = async (
  db: IDBWrapper,
  workflowOutputData: WorkflowOutputData
): Promise<WorkflowOutput> => {
  const date = new Date();
  const newWorkflowOutputData = {
    OutputID: workflowOutputData.OutputID ?? uuidv4(),
    CreatedAt: date,
    ...workflowOutputData,
    Error: workflowOutputData.Error
      ? (workflowOutputData.Error?.message ??
        JSON.stringify(workflowOutputData.Error))
      : undefined,
    UpdatedAt: date,
  };
  const hash = await hashObject(newWorkflowOutputData);
  const newWorkflowOutput = { ...newWorkflowOutputData, Hash: hash };
  await db.update(DBStores.workflowOutput, newWorkflowOutput);
  return newWorkflowOutput;
};

export const updateWorkflowOutput = async (
  db: IDBWrapper,
  id: string,
  workflowOutputData: Partial<WorkflowOutputData>
): Promise<WorkflowOutput> => {
  const workflowOutput = (await db.get(
    DBStores.workflowOutput,
    id
  )) as WorkflowOutput;
  const updatedWorkflowOutput = {
    ...workflowOutput,
    ...workflowOutputData,
    Error: workflowOutputData.Error
      ? (workflowOutputData.Error?.message ??
        JSON.stringify(workflowOutputData.Error))
      : workflowOutput.Error,
    UpdatedAt: new Date(),
  };
  const hash = await hashObject(updatedWorkflowOutput);
  updatedWorkflowOutput.Hash = hash;
  await db.update(DBStores.workflow, updatedWorkflowOutput);
  return updatedWorkflowOutput;
};

export const getWorkflowOutputsByWorkflowId = async (
  db: IDBWrapper,
  workflowId: string
): Promise<WorkflowOutput[]> => {
  const workflowOutputs = (await db.getAllFromIndex(
    DBStores.workflowOutput,
    DBKeyPathes.workflowID,
    workflowId
  )) as WorkflowOutput[];
  return workflowOutputs.toSorted((a, b) =>
    a.CreatedAt < b.CreatedAt ? 1 : -1
  );
};

export const deleteWorkflowOutput = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  await db.delete(DBStores.workflowOutput, id);
};

export const getChainModels = async (
  db: IDBWrapper,
  chainId: string
): Promise<ChainModel[]> => {
  const models = (await db.getAllFromIndex(
    DBStores.chainModel,
    DBKeyPathes.chainID,
    chainId
  )) as ChainModel[];
  return models.toSorted((a, b) => (a.Order > b.Order ? 1 : -1));
};

export const createOrUpdateChainModel = async (
  db: IDBWrapper,
  chainModel: ChainModel
): Promise<void> => {
  const existingChainModel = await db.get(
    DBStores.chainModel,
    chainModel.ChainModelID
  );

  const date = new Date();
  if (existingChainModel) {
    await db.update(DBStores.chainModel, {
      ...chainModel,
      UpdatedAt: date,
    });
  } else {
    await db.add(DBStores.chainModel, {
      ...chainModel,
      CreatedAt: date,
      UpdatedAt: date,
    });
  }
};

export const deleteChainModel = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  await db.delete(DBStores.chainModel, id);
};

export const insertChainModel = async (
  db: IDBWrapper,
  chainModel: ChainModel
): Promise<void> => {
  const modelsByChainId = await getChainModels(db, chainModel.ChainID);
  await createOrUpdateChainModel(db, chainModel);

  const modelsToUpdate = modelsByChainId.filter(
    (p) => p.Order >= chainModel.Order
  );
  for (const model of modelsToUpdate) {
    await db.update(DBStores.chainModel, {
      ...model,
      Order: model.Order + 1,
      UpdatedAt: new Date(),
    });
  }
};

export const removeChainModels = async (
  db: IDBWrapper,
  connectorFolder: string
): Promise<void> => {
  const modelsByConnectorFolder = (await db.getAllFromIndex(
    DBStores.chainModel,
    DBKeyPathes.connectorFolder,
    connectorFolder
  )) as ChainModel[];

  await Promise.all(
    modelsByConnectorFolder.map(async (model) => {
      await deleteChainModel(db, model.ChainModelID);
    })
  );
};

export const getAllSavedSettings = async (
  db: IDBWrapper
): Promise<ConnectorSettings[] | undefined> => {
  const connectorSettings = (await db.getAll(
    DBStores.connectorSettings
  )) as ConnectorSettings[];
  return connectorSettings;
};

export const getConnectorSettings = async (
  db: IDBWrapper,
  connectorFolder: string
): Promise<ConnectorSettings> => {
  const connectorSettings = (await db.get(
    DBStores.connectorSettings,
    connectorFolder
  )) as ConnectorSettings;
  return connectorSettings;
};

export const updateConnectorSettings = async (
  db: IDBWrapper,
  connectorFolder: string,
  settings: ConnectorSetting[]
): Promise<ConnectorSettings> => {
  const connectorSettingsToUpdate = await getConnectorSettings(
    db,
    connectorFolder
  );
  const newConnectorSettings = {
    ...connectorSettingsToUpdate,
    ConnectorFolder: connectorFolder,
    Settings: settings,
    UpdatedAt: new Date(),
  };

  await db.update(DBStores.connectorSettings, newConnectorSettings);
  return newConnectorSettings;
};

export const removeConnectorSettings = async (
  db: IDBWrapper,
  connectorFolder: string
): Promise<void> => {
  await db.delete(DBStores.connectorSettings, connectorFolder);
};

export const createDataset = async (
  db: IDBWrapper,
  dataset?: Partial<Dataset>
): Promise<Dataset> => {
  const date = new Date();
  const newDataset: Dataset = {
    DatasetID: uuidv4(),
    Title: dataset?.Title ?? DICTIONARY.labels.untitled,
    CreatedAt: date,
    UpdatedAt: date,
    ...dataset,
  };
  await db.add(DBStores.dataset, newDataset);

  return newDataset;
};
export const getDatasets = async (db: IDBWrapper): Promise<Dataset[]> => {
  const datasets = (await db.getAll(DBStores.dataset)) as Dataset[];
  return datasets;
};

export const getDatasetById = async (
  db: IDBWrapper,
  id: string
): Promise<Dataset> => {
  const dataset = (await db.get(DBStores.dataset, id)) as Dataset;
  return dataset;
};

export const updateDataset = async (
  db: IDBWrapper,
  id: string,
  values: Partial<Dataset>
): Promise<void> => {
  const datasetToUpdate = (await db.get(DBStores.dataset, id)) as Dataset;
  await db.update(DBStores.dataset, {
    ...datasetToUpdate,
    ...values,
    UpdatedAt: new Date(),
  });
};

export const deleteDataset = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  await db.delete(DBStores.dataset, id);
};

export const deleteAllOutputs = async (
  db: IDBWrapper,
  chainId: string
): Promise<void> => {
  const outputs = await getOutputsByChainId(db, chainId);
  await Promise.all(
    outputs.map(async (output) => {
      await deleteOutput(db, output.OutputID);
    })
  );
};

export const deleteAllWorkflowOutputs = async (
  db: IDBWrapper,
  workflowId: string
): Promise<void> => {
  const workflowOutputs = await getWorkflowOutputsByWorkflowId(db, workflowId);
  await Promise.all(
    workflowOutputs.map(async (workflowOutput) => {
      await deleteWorkflowOutput(db, workflowOutput.OutputID);
    })
  );
};

export const deleteAllChainsAndCollections = async (
  db: IDBWrapper
): Promise<void> => {
  const chains = (await db.getAll(DBStores.promptChain)) as PromptChain[];

  await Promise.all(
    chains.map(async (chain) => {
      await deletePromptChain(db, chain.ChainID);
    })
  );

  const collections = (await db.getAll(
    DBStores.chainCollection
  )) as ChainCollection[];
  await Promise.all(
    collections.map(async (collection) => {
      await deleteChainCollection(db, collection.CollectionID);
    })
  );

  const datasets = (await db.getAll(DBStores.dataset)) as Dataset[];
  await Promise.all(
    datasets.map(async (dataset) => {
      await deleteDataset(db, dataset.DatasetID);
    })
  );
};

export const createVariable = async (
  db: IDBWrapper,
  chainID: string,
  name: string,
  value?: string
): Promise<string> => {
  const date = new Date();
  const newVariable: Variable = {
    VariableID: uuidv4(),
    ChainID: chainID,
    Name: name,
    Value: value,
    CreatedAt: date,
    UpdatedAt: date,
  };
  await db.add(DBStores.variable, newVariable);

  return newVariable.VariableID;
};

export const updateVariable = async (
  db: IDBWrapper,
  id: string,
  values: Partial<Variable>
): Promise<void> => {
  const variableToUpdate = (await db.get(DBStores.variable, id)) as Variable;
  await db.update(DBStores.variable, {
    ...variableToUpdate,
    ...values,
    UpdatedAt: new Date(),
  });
};

export const deleteVariable = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  await db.delete(DBStores.variable, id);
};

export const getVariablesByChainId = async (
  db: IDBWrapper,
  chainId: string
): Promise<Variable[]> => {
  const variables = (await db.getAllFromIndex(
    DBStores.variable,
    DBKeyPathes.chainID,
    chainId
  )) as Variable[];

  return variables;
};

const deleteAllVariables = async (
  db: IDBWrapper,
  chainId: string
): Promise<void> => {
  const variables = await getVariablesByChainId(db, chainId);
  await Promise.all(
    variables.map(async (variable) => {
      await deleteOutput(db, variable.VariableID);
    })
  );
};

export const createWorkflow = async (
  db: IDBWrapper,
  workflow?: Partial<Workflow>
): Promise<string> => {
  const date = new Date();
  const newWorkflow: Workflow = {
    WorkflowID: uuidv4(),
    Title: DICTIONARY.labels.untitled,
    Chains: [],
    ...workflow,
    CreatedAt: date,
    UpdatedAt: date,
  };
  await db.add(DBStores.workflow, newWorkflow);

  return newWorkflow.WorkflowID;
};

export const updateWorkflow = async (
  db: IDBWrapper,
  id: string,
  values: Partial<Workflow>
): Promise<void> => {
  const workflowToUpdate = (await db.get(DBStores.workflow, id)) as Workflow;
  await db.update(DBStores.workflow, {
    ...workflowToUpdate,
    ...values,
    UpdatedAt: new Date(),
  });
};

export const deleteWorkflow = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  await db.delete(DBStores.workflow, id);
  await deleteAllWorkflowOutputs(db, id);
};

export const getWorkflowById = async (
  db: IDBWrapper,
  id: string
): Promise<Workflow> => {
  const workflow = (await db.get(DBStores.workflow, id)) as Workflow;
  return workflow;
};

export const getAllWorkflows = async (db: IDBWrapper): Promise<Workflow[]> => {
  const workflows = (await db.getAll(DBStores.workflow)) as Workflow[];
  return workflows;
};

const extractRelevantContent = (
  content: string,
  searchTerm: string
): string => {
  const lowerContent = content.toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  const index = lowerContent.indexOf(lowerSearchTerm);

  if (index === -1) {
    return '';
  }

  const start = Math.max(0, index - 20);
  const end = Math.min(content.length, index + searchTerm.length + 20);

  let result = content.slice(start, end);

  if (start > 0) {
    result = '...' + result;
  }
  if (end < content.length) {
    result = result + '...';
  }

  return result;
};

export const searchPromptChainContent = async (
  db: IDBWrapper,
  searchTerm: string
): Promise<
  {
    chainId: string;
    chainTitle: string;
    content: string;
  }[]
> => {
  const matches: PromptVersion[] = (await db.searchByIndex(
    DBStores.promptVersion,
    DBKeyPathes.content,
    searchTerm
  )) as PromptVersion[];

  const resultsPromises = matches.map(async (match: PromptVersion) => {
    const prompt = (await db.get(DBStores.prompt, match.PromptID)) as Prompt;
    if (prompt.ActiveVersionID === match.VersionID) {
      const chain = (await db.get(
        DBStores.promptChain,
        prompt.ChainID
      )) as PromptChain;

      const content = extractRelevantContent(match.Content, searchTerm);

      return {
        chainId: chain.ChainID,
        chainTitle: chain.Title,
        content: content,
      };
    }
    return null;
  });

  const results = await Promise.all(resultsPromises);
  return results.filter((result) => result !== null) as {
    chainId: string;
    chainTitle: string;
    content: string;
  }[];
};
