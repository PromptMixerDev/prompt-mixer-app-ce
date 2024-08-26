import { DICTIONARY } from 'dictionary';
import { type Model } from 'flexlayout-react';
import { ReactComponent as AddIcon } from 'assets/icons/add.svg';
import { SIDE_BAR, SPLITTER_SIZE } from '../FlexLayout/FlexLayout.config';
import { type SideBarElements } from './TitleBar';
import { type ContextMenuOption } from '../Modals/ContextMenuWithOptions';
import { updateTabAttributes } from '../FlexLayout/FlexLayout.helper';

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
