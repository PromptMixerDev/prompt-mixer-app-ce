import type {
  IModel,
  ModelOption,
} from 'components/ModelsSelector/ModelsSelector';

export const isSameModel = (
  modelOption: ModelOption,
  selectedModel: IModel | undefined
): boolean => {
  return (
    modelOption.Model === selectedModel?.Model &&
    modelOption.ConnectorName === selectedModel?.ConnectorName
  );
};
