import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type TreeItem } from 'db/workspaceDb';

interface ChainState {
  treeData: TreeItem[];
  loading: boolean;
}

const initialState: ChainState = {
  treeData: [],
  loading: false,
};

const updateTreeItemById = (
  items: TreeItem[],
  id: string,
  label: string
): TreeItem[] => {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, label };
    } else if (item.children) {
      return {
        ...item,
        children: updateTreeItemById(item.children, id, label),
      };
    }
    return item;
  });
};

const treeSlice = createSlice({
  name: 'tree',
  initialState,
  reducers: {
    setTreeData(state, action: PayloadAction<TreeItem[]>) {
      state.treeData = action.payload;
    },
    updateTreeItem(
      state,
      action: PayloadAction<{ id: string; label: string }>
    ) {
      const { id, label } = action.payload;
      state.treeData = updateTreeItemById(state.treeData, id, label);
    },
    setTreeLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    resetTreeState() {
      return initialState;
    },
  },
});

export const { setTreeData, updateTreeItem, setTreeLoading, resetTreeState } =
  treeSlice.actions;
export default treeSlice.reducer;
