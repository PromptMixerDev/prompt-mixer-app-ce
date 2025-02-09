import { v4 as uuidv4 } from 'uuid';
import groupBy from 'lodash/groupBy';
import { DICTIONARY } from 'dictionary';
import { type Model } from 'flexlayout-react';
import { ReactComponent as FileTextIcon } from 'assets/icons/file-text.svg';
import { ReactComponent as TextIcon } from 'assets/icons/text.svg';
import { ReactComponent as DatasetBlueIcon } from 'assets/icons/dataset-blue.svg';
import { ReactComponent as AddIcon } from 'assets/icons/add.svg';

import { TreeEntityTypes, TreeItem } from 'db/workspaceDb';
import {
  getDatasetTabInfo,
  getTabsInfo,
} from 'components/Tree/TreeNode/TreeNode.helper';
import { AppDispatch } from 'store/store';
import {
  addNewTabsHandler,
  updateTabAttributes,
} from '../FlexLayout/FlexLayout.helper';
import { SIDE_BAR, SPLITTER_SIZE } from '../FlexLayout/FlexLayout.config';
import { type SideBarElements } from './TitleBar';
import { type ContextMenuOption } from '../Modals/ContextMenuWithOptions';

export const handleSideBarElements = (
  isOpen: boolean,
  sideBarElements: SideBarElements
): void => {
  const { splitter, flexlayout } = sideBarElements;

  if (isOpen) {
    if (splitter) {
      splitter.style.display = ``;
    }
    flexlayout!.style.left = ``;
  } else {
    if (splitter) {
      splitter.style.display = 'none';
    }
    flexlayout!.style.left = `-${SPLITTER_SIZE}px`;
  }
};

export const toggleSideBar = (
  sideBarRef: React.RefObject<HTMLDivElement>,
  sideBarWidth: number,
  setSideBarWidth: (value: number) => void,
  sideBarElements: SideBarElements,
  model: Model
): void => {
  const width = sideBarRef.current?.clientWidth;
  if (width! > 0) {
    setSideBarWidth(width!);
    updateTabAttributes(SIDE_BAR, { width: 0, height: 0 }, model);
    handleSideBarElements(false, sideBarElements);
  } else {
    updateTabAttributes(
      SIDE_BAR,
      { width: sideBarWidth + SPLITTER_SIZE },
      model
    );
    handleSideBarElements(true, sideBarElements);
  }
};

export const getContextMenuOptions = (
  handleCreateWorkspaceClick: () => void
): ContextMenuOption[] => {
  return [
    {
      label: DICTIONARY.labels.createWorkspace,
      icon: AddIcon,
      onClick: handleCreateWorkspaceClick,
    },
  ];
};

export const getMainSearchOptions = (
  treeData: TreeItem[],
  text: string,
  model: Model,
  dispatch: AppDispatch,
  setSearchFieldKey: (value: string) => void,
  clearSearchOptions: () => void
): ContextMenuOption[][] => {
  const treeItemGroups = groupBy(treeData, 'entityType');

  const optionsGroups: ContextMenuOption[][] = [];

  for (const key of [TreeEntityTypes.CHAIN, TreeEntityTypes.DATASET]) {
    const options: ContextMenuOption[] = [];
    treeItemGroups[key].forEach((item) => {
      if (item.label.toLowerCase().includes(text.toLowerCase())) {
        options.push({
          groupLabel:
            key === TreeEntityTypes.CHAIN
              ? DICTIONARY.labels.prompts
              : DICTIONARY.labels.datasets,
          label: item.label,
          icon: key === TreeEntityTypes.CHAIN ? FileTextIcon : DatasetBlueIcon,
          onClick: () => {
            if (key === TreeEntityTypes.CHAIN) {
              addNewTabsHandler(
                getTabsInfo(item.id, item.label),
                model,
                dispatch
              );
            } else {
              addNewTabsHandler(
                getDatasetTabInfo(item.id, item.label),
                model,
                dispatch
              );
            }

            setSearchFieldKey(uuidv4());
            clearSearchOptions();
          },
        });
      }
    });

    if (options.length) {
      optionsGroups.push(options);
    }
  }

  return optionsGroups;
};

export const getAdditionalSearchOptions = (
  options: {
    chainId: string;
    chainTitle: string;
    content: string;
  }[],
  model: Model,
  dispatch: AppDispatch,
  setSearchFieldKey: (value: string) => void,
  clearSearchOptions: () => void
): ContextMenuOption[][] => {
  if (options.length === 0) {
    return [];
  }
  return [
    options.map((option) => ({
      groupLabel: DICTIONARY.labels.text,
      label: option.content,
      icon: TextIcon,
      onClick: () => {
        addNewTabsHandler(
          getTabsInfo(option.chainId, option.chainTitle),
          model,
          dispatch
        );

        setSearchFieldKey(uuidv4());
        clearSearchOptions();
      },
    })),
  ];
};
