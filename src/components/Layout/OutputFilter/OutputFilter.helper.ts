import { DICTIONARY } from 'dictionary';
import { ContextMenuWithCheckboxesOption } from '../../Modals/ContextMenuWithCheckboxes';

export const getModelOptions = (
  models: string[],
  onClick: () => void
): ContextMenuWithCheckboxesOption[] =>
  models.map((model) => ({
    label: model,
    checked: true,
    onClick,
  }));

export const getRatingOptions = (
  onClick: () => void
): ContextMenuWithCheckboxesOption[] => [
  {
    label: DICTIONARY.labels.nice,
    checked: true,
    onClick,
  },
  {
    label: DICTIONARY.labels.neutral,
    checked: true,
    onClick,
  },
  {
    label: DICTIONARY.labels.dislike,
    checked: true,
    onClick,
  },
];
