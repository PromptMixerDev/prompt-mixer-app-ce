import { v4 as uuidv4 } from 'uuid';
import {
  type ChainModel,
  type IDBWrapper,
  createOrUpdateChainModel,
  insertChainModel,
  deleteChainModel,
  type Property,
  type ConnectorSetting,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import { setModelsByChainId } from 'store/model/modelSlice';
import type { IModel, IConnector, ModelOption } from './ModelsSelector';

const convertFromConnectorValue = (value: any, type: string): string => {
  switch (type) {
    case 'array':
      return value.join();
    case 'boolean':
      return value.toString();
    default:
      return value;
  }
};

const convertToConnectorValue = (
  value: string | undefined,
  type: string
): any => {
  if (!value) {
    return null;
  }
  switch (type) {
    case 'array':
      return value.split(',');
    case 'boolean':
      return value === 'true';
    case 'number':
      return Number(value);
    default:
      return value;
  }
};

export const normalizeProperties = (
  properties: Property[]
): Record<string, unknown> => {
  const res: Record<string, unknown> = {};
  properties.forEach((property) => {
    res[property.PropertyId] = convertToConnectorValue(
      property.Value,
      property.Type
    );
  });
  return res;
};

export const normalizeSettings = (
  settings: ConnectorSetting[]
): Record<string, unknown> => {
  const res: Record<string, unknown> = {};
  settings.forEach((setting) => {
    res[setting.SettingID] = convertToConnectorValue(
      setting.Value,
      setting.Type
    );
  });
  return res;
};

const getModelOptions = (
  connectors: IConnector[],
  chainId: string | undefined
): ModelOption[] => {
  const modelOptions: ModelOption[] = [];
  connectors.forEach((connector) => {
    connector.models.forEach((model) => {
      modelOptions.push({
        ChainID: chainId,
        Model: model,
        ConnectorFolder: connector.connectorFolder,
        ConnectorName: connector.connectorName,
        IconBase64: connector.iconBase64,
        Properties: connector.properties?.map((item) => ({
          PropertyId: item.id,
          Name: item.name,
          Value: convertFromConnectorValue(item.value, item.type),
          Type: item.type,
        })),
      });
    });
  });

  return modelOptions;
};

export const handleModelChange = (
  db: IDBWrapper,
  model: IModel,
  models: IModel[],
  dispatch: AppDispatch,
  tabId: string,
  chainId?: string
): void => {
  if (chainId) {
    createOrUpdateChainModel(db, model as ChainModel).catch((error) => {
      console.error(error);
    });
  }
  let newModels: IModel[];
  const index = models.findIndex(
    (item) => item.ChainModelID === model.ChainModelID
  );

  if (index !== -1) {
    newModels = models.map((item) =>
      item.ChainModelID === model.ChainModelID ? model : item
    );
  } else {
    newModels = [...models, model];
  }

  dispatch(
    setModelsByChainId({ chainId: chainId ?? tabId, models: newModels })
  );
};

export const handleAddModel = (
  db: IDBWrapper,
  order: number,
  models: IModel[],
  dispatch: AppDispatch,
  tabId: string,
  chainId?: string
): void => {
  const newModel = {
    ChainModelID: uuidv4(),
    ChainID: chainId,
    Order: order + 1,
  };
  if (chainId) {
    insertChainModel(db, newModel as ChainModel).catch((error) => {
      console.error(error);
    });
  }

  const existingModels = models.map((model) => {
    if (model.Order > order) {
      return {
        ...model,
        Order: model.Order + 1,
      };
    } else {
      return model;
    }
  });

  const newModels = [...existingModels, newModel].toSorted((a, b) =>
    a.Order > b.Order ? 1 : -1
  );
  dispatch(
    setModelsByChainId({ chainId: chainId ?? tabId, models: newModels })
  );
};

export const handleDeleteModel = (
  db: IDBWrapper,
  id: string,
  models: IModel[],
  dispatch: AppDispatch,
  tabId: string,
  chainId?: string
): void => {
  if (chainId) {
    deleteChainModel(db, id).catch((error) => {
      console.error(error);
    });
  }
  const newModels = models.filter((model) => model.ChainModelID !== id);
  dispatch(
    setModelsByChainId({ chainId: chainId ?? tabId, models: newModels })
  );
};

export const handleInstalledConnectors = (
  chainId: string | undefined,
  installedConnectors: IConnector[],
  setModelOptions: (value: ModelOption[]) => void
): void => {
  const modelOptions = getModelOptions(installedConnectors, chainId);
  setModelOptions(modelOptions);
};
