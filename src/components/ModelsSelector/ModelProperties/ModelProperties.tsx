import React, { useEffect, useRef, useState } from 'react';
import { DICTIONARY } from 'dictionary';
import { type Property } from 'db/workspaceDb';
import { ReactComponent as AddIcon } from 'assets/icons/add.svg';
import { type ModelType } from 'store/model/modelSlice';
import { SelectProperty } from './SelectProperty';
import { type ModelOption, type IModel } from '../ModelsSelector';
import { InputProperty } from './InputProperty';
import { Button, ButtonTypes } from '../../Button';
import { PropertyMenu } from './PropertyMenu';
import {
  handleModelChange,
  handlePropertyAdd,
  handlePropertyChange,
} from './ModelProperties.helper';
import styles from './ModelProperties.module.css';

interface ModelOptionsProps {
  model: IModel;
  modelOptions: ModelOption[];
  onModelChange: (value: IModel) => void;
}

export const ModelProperties: React.FC<ModelOptionsProps> = ({
  model,
  modelOptions,
  onModelChange,
}) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [showPropertyMenu, setShowPropertyMenu] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelType | undefined>();
  const [selectedModelOption, setSelectedModelOption] =
    useState<ModelOption | null>(null);

  const changeModel = (modelOption: ModelOption): void => {
    handleModelChange(
      modelOption,
      model,
      setSelectedModel,
      onModelChange,
      setSelectedModelOption
    );
  };

  const changeProperty = (index: number, value: string): void => {
    handlePropertyChange(
      index,
      value,
      selectedModel,
      setSelectedModel,
      onModelChange
    );
  };

  const addProperty = (property: Property): void => {
    handlePropertyAdd(property, selectedModel, setSelectedModel, onModelChange);
  };

  useEffect(() => {
    if (model?.Model && modelOptions.length) {
      setSelectedModel(model);
      const modelOption = modelOptions.find(
        (modelOption) =>
          modelOption.Model === model.Model &&
          modelOption.ConnectorName === model.ConnectorName
      );
      if (modelOption) {
        setSelectedModelOption(modelOption);
      }
    }
  }, [model, modelOptions]);

  return (
    <div className={styles.wrapper}>
      <SelectProperty
        modelOptions={modelOptions}
        selectedModel={selectedModel}
        onChange={changeModel}
      />
      {selectedModel?.Properties?.map((property, ind) => (
        <InputProperty
          key={`${selectedModel.Model}_${property.PropertyId}`}
          index={ind}
          property={property}
          onChange={changeProperty}
        />
      ))}
      {selectedModelOption?.Properties && (
        <Button
          ref={buttonRef}
          type={ButtonTypes.iconText}
          buttonClass={styles.addPropertyButton}
          onClick={() => setShowPropertyMenu(!showPropertyMenu)}
        >
          <AddIcon />
          <span>{DICTIONARY.labels.addProperty}</span>
        </Button>
      )}
      {showPropertyMenu && selectedModelOption?.Properties && (
        <PropertyMenu
          properties={selectedModelOption?.Properties}
          setShowPropertyMenu={setShowPropertyMenu}
          ignoreElementRef={buttonRef}
          triggerRef={buttonRef}
          addProperty={addProperty}
        />
      )}
    </div>
  );
};
