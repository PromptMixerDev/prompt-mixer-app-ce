import React, { useContext, useEffect, useState } from 'react';
import { type ChainModel } from 'db/workspaceDb';
import { useAppDispatch, useAppSelector } from 'hooks';
import { WorkspaceDatabaseContext } from 'contexts';
import { Model } from './Model';
import {
  handleAddModel,
  handleDeleteModel,
  handleInstalledConnectors,
  handleModelChange,
} from './ModelsSelector.helper';

export interface ConnectorParameter {
  id: string;
  name: string;
  value: any;
  type: string;
}
export interface IConnector {
  connectorFolder: string;
  connectorName: string;
  models: string[];
  settings: ConnectorParameter[];
  iconBase64?: string;
  properties?: ConnectorParameter[];
  description?: string;
  author?: string;
  updated?: string;
  link?: string;
  tags?: string[] | null;
}

export interface IModel extends Omit<ChainModel, 'ChainID' | 'CreatedAt'> {
  ChainID?: string;
}

export interface ModelOption
  extends Omit<ChainModel, 'ChainModelID' | 'ChainID' | 'Order' | 'CreatedAt'> {
  ChainID?: string;
}

interface ModelsSelectorProps {
  models: IModel[];
  chainId?: string;
  tabId: string;
}

export const ModelsSelector: React.FC<ModelsSelectorProps> = ({
  models,
  chainId,
  tabId,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { installedConnectors } = useAppSelector((store) => store.connectors);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);

  const onModelChange = (model: IModel): void => {
    handleModelChange(db, model, models, dispatch, tabId, chainId);
  };

  const onModelAdd = (order: number): void => {
    handleAddModel(db, order, models, dispatch, tabId, chainId);
  };

  const onModelDelete = (id: string): void => {
    handleDeleteModel(db, id, models, dispatch, tabId, chainId);
  };

  useEffect(() => {
    handleInstalledConnectors(chainId, installedConnectors, setModelOptions);
  }, [installedConnectors]);

  return (
    <div>
      {models.map((model, index) => (
        <Model
          key={model.ChainModelID}
          index={index}
          model={model}
          modelOptions={modelOptions}
          modelsCount={models.length}
          onModelChange={onModelChange}
          onModelAdd={onModelAdd}
          onModelDelete={onModelDelete}
        />
      ))}
    </div>
  );
};
