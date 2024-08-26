import { createSelector } from '@reduxjs/toolkit';
import { type TreeItem } from 'db/workspaceDb';
import { type RootState } from '../store';

const selectTreeData = (state: RootState): TreeItem[] => state.tree.treeData;

const findTreeItemById = (
  items: TreeItem[],
  id: string | undefined
): TreeItem | undefined => {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findTreeItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
};

export const selectTreeItemById = (
  id: string | undefined
): ((state: RootState) => TreeItem | undefined) =>
  createSelector([selectTreeData], (treeData: TreeItem[]) =>
    findTreeItemById(treeData, id)
  );
