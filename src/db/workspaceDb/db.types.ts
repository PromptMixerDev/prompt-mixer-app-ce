import { type DBSchema } from 'idb';

export interface ChainCollection {
  CollectionID: string;
  Title: string;
  Description: string;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface PromptChain {
  ChainID: string;
  CollectionID?: string;
  Title: string;
  Prompts: string[];
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface Prompt {
  PromptID: string;
  ChainID: string;
  Enabled: boolean;
  ActiveVersionID: string;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface PromptVersion {
  VersionID: string;
  PromptID: string;
  VersionNumber: number;
  Content: string;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface Completion {
  Error: string | undefined;
  Content: string | null;
  TokenUsage: number | undefined;
}

export interface Property {
  PropertyId: string;
  Name: string;
  Value?: string;
  Type: string;
}

export interface Output {
  OutputID: string;
  ChainID: string;
  Completions: Completion[];
  CompletedAt?: Date;
  ModelType: string;
  ConnectorName?: string;
  Properties?: Property[];
  Hash: string;
  PromptVersions: Array<[number, number]>;
  Error?: string;
  Loading?: boolean;
  Like?: boolean;
  Dislike?: boolean;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface WorkflowCompletion {
  Error: string | undefined;
  Content: string | null;
  TokenUsage: number | undefined;
  ModelType: string;
  ConnectorName?: string;
  Properties?: Property[];
  ChainName: string;
  ChainID: string;
}

export interface WorkflowOutput {
  OutputID: string;
  WorkflowID: string;
  Completions: WorkflowCompletion[];
  CompletedAt?: Date;
  Hash: string;
  Error?: string;
  Loading?: boolean;
  Like?: boolean;
  Dislike?: boolean;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface ChainModel {
  ChainModelID: string;
  ChainID: string;
  Order: number;
  Model?: string;
  ConnectorFolder?: string;
  ConnectorName?: string;
  IconBase64?: string;
  Properties?: Property[];
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface ConnectorSetting {
  SettingID: string;
  Name: string;
  Value?: string;
  Type: string;
}

export interface ConnectorSettings {
  ConnectorFolder: string;
  Settings: ConnectorSetting[];
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface Dataset {
  DatasetID: string;
  Title: string;
  Headers?: string[];
  Data?: any[];
  CollectionID?: string;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface Variable {
  VariableID: string;
  ChainID: string;
  Name: string;
  Value?: string;
  WorkflowValues?: Record<string, string | undefined>;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export interface Workflow {
  WorkflowID: string;
  Title: string;
  Chains: string[];
  CollectionID?: string;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

enum ChangeLogActions {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}
export interface ChangeLogItem {
  ChangeLogItemID: string;
  Action: ChangeLogActions;
  Type: DBStores;
  ItemID: string;
  Item?: DBValue;
  CreatedAt: Date;
}

export type DBValue =
  | ChainCollection
  | PromptChain
  | Prompt
  | PromptVersion
  | Output
  | ChainModel
  | ConnectorSettings
  | Dataset
  | Variable
  | Workflow
  | WorkflowOutput
  | ChangeLogItem;

export interface PromptMixerDBSchema extends DBSchema {
  ChainCollection: {
    key: string;
    value: ChainCollection;
  };
  PromptChain: {
    key: string;
    value: PromptChain;
    indexes: { CollectionID: string };
  };
  Prompt: {
    key: string;
    value: Prompt;
    indexes: { ChainID: string };
  };
  PromptVersion: {
    key: string;
    value: PromptVersion;
    indexes: { PromptID: string };
  };
  Output: {
    key: string;
    value: Output;
    indexes: { ChainID: string };
  };
  ChainModel: {
    key: string;
    value: ChainModel;
    indexes: { ChainID: string; ConnectorFolder: string };
  };
  ConnectorSettings: {
    key: string;
    value: ConnectorSettings;
  };
  Dataset: {
    key: string;
    value: Dataset;
    indexes: { CollectionID: string };
  };
  Variable: {
    key: string;
    value: Variable;
    indexes: { ChainID: string };
  };
  ChangeLogItem: {
    key: string;
    value: ChangeLogItem;
  };
  Workflow: {
    key: string;
    value: Workflow;
    indexes: { CollectionID: string };
  };
  WorkflowOutput: {
    key: string;
    value: WorkflowOutput;
    indexes: { WorkflowID: string };
  };
}

export enum DBStores {
  chainCollection = 'ChainCollection',
  promptChain = 'PromptChain',
  prompt = 'Prompt',
  promptVersion = 'PromptVersion',
  output = 'Output',
  chainModel = 'ChainModel',
  connectorSettings = 'ConnectorSettings',
  dataset = 'Dataset',
  variable = 'Variable',
  workflow = 'Workflow',
  changeLogItem = 'ChangeLogItem',
  workflowOutput = 'WorkflowOutput',
}

export enum DBKeyPathes {
  collectionID = 'CollectionID',
  chainID = 'ChainID',
  promptID = 'PromptID',
  versionID = 'VersionID',
  outputID = 'OutputID',
  chainModelID = 'ChainModelID',
  connectorFolder = 'ConnectorFolder',
  datasetID = 'DatasetID',
  variableID = 'VariableID',
  changeLogItemID = 'ChangeLogItemID',
  workflowID = 'WorkflowID',
}

export interface DBConfig {
  version?: number;
}
