import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg';
import { ReactComponent as AddIcon } from 'assets/icons/add.svg';
import { DICTIONARY } from 'dictionary';
import { type Property } from 'db/workspaceDb';
import { type ContextMenuOption } from '../../Modals/ContextMenuWithOptions';

export const getContextMenuOptions = (
  deleteModel: (e: React.MouseEvent) => void,
  addModel: (e: React.MouseEvent) => void
): ContextMenuOption[][] => [
  [
    {
      label: DICTIONARY.labels.deleteModel,
      icon: DeleteIcon,
      onClick: deleteModel,
    },
    {
      label: DICTIONARY.labels.addModel,
      icon: AddIcon,
      onClick: addModel,
    },
  ],
];

export const stringifyModelProperties = (
  properties: Property[] | undefined
): string => {
  const propertyArr = properties
    ?.filter((property) => property.Value)
    ?.map((property) => `${property.Name}: ${property.Value}`);

  return propertyArr?.join(', ') ?? '';
};

export const getModelInfo = (
  model: string | undefined,
  properties: Property[] | undefined,
  connectorName?: string | undefined
): string => {
  const subsrings: string[] = [];
  const propertiesSubstring = stringifyModelProperties(properties);
  if (connectorName) {
    subsrings.push(connectorName);
  }
  if (model) {
    subsrings.push(model);
  }
  if (propertiesSubstring) {
    subsrings.push(propertiesSubstring);
  }
  return subsrings.join(', ');
};

export const getModelTitle = (
  modelsCount: number,
  index: number,
  model: string | undefined
): string => {
  return (
    model ??
    (modelsCount > 1
      ? `${DICTIONARY.labels.model} ${index + 1}`
      : DICTIONARY.labels.model)
  );
};
