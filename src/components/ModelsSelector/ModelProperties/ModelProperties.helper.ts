import { type Property } from 'db/workspaceDb';
import type { ModelOption, IModel } from '../ModelsSelector';

export const handleModelChange = (
  modelOption: ModelOption,
  model: IModel,
  setSelectedModel: (value: IModel) => void,
  onModelChange: (value: IModel) => void,
  setSelectedModelOption: (value: ModelOption) => void
): void => {
  const updatedModel = {
    ...modelOption,
    Properties: [],
    ChainID: model.ChainID,
    Order: model.Order,
    ChainModelID: model.ChainModelID,
  };

  setSelectedModel(updatedModel);
  setSelectedModelOption(modelOption);
  onModelChange(updatedModel);
};

export const handlePropertyChange = (
  index: number,
  value: string,
  selectedModel: IModel | undefined,
  setSelectedModel: (value: IModel) => void,
  onModelChange: (value: IModel) => void
): void => {
  if (selectedModel) {
    const updatedModel = {
      ...selectedModel,
      Properties: selectedModel.Properties?.map((item, ind) => {
        if (ind === index) {
          return { ...item, Value: value };
        }
        return item;
      }),
    };

    setSelectedModel(updatedModel);
    onModelChange(updatedModel);
  }
};

export const handlePropertyAdd = (
  property: Property,
  selectedModel: IModel | undefined,
  setSelectedModel: (value: IModel) => void,
  onModelChange: (value: IModel) => void
): void => {
  if (selectedModel) {
    const existingProperty = selectedModel.Properties?.find(
      (el) => el.PropertyId === property.PropertyId
    );
    if (!existingProperty) {
      const updatedModel = {
        ...selectedModel,
        Properties: selectedModel.Properties
          ? [...selectedModel.Properties, property]
          : [property],
      };

      setSelectedModel(updatedModel);
      onModelChange(updatedModel);
    }
  }
};
