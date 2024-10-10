import { ContextMenuWithCheckboxesOption } from '../../Modals/ContextMenuWithCheckboxes';
import { FilterItem, FilterType } from 'store/outputs/outputsSlice';

export const getOptions = (
  items: FilterItem[] | undefined,
  handleUpdateFilterOption: (
    filterType: FilterType,
    optionName: string
  ) => void,
  filterType: FilterType
): ContextMenuWithCheckboxesOption[] =>
  items?.map((item) => ({
    label: item.name,
    checked: item.checked,
    onClick: () => {
      handleUpdateFilterOption(filterType, item.name);
    },
  })) ?? [];
