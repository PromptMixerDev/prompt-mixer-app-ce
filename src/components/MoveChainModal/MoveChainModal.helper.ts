import { type IDBPDatabase } from 'idb';
import sortBy from 'lodash/sortBy';
import {
  type IDBWrapper as CommonIDBWrapper,
  getWorkspaces,
  type Workspace,
  FREE_PLAN,
} from 'db/commonDb';
import {
  initIDB,
  IDBWrapper,
  getChainCollections,
  type ChainCollection,
  DEFAULT_DB,
  DEFAULT_USER_ID,
} from 'db/workspaceDb';
import { DICTIONARY } from 'dictionary';

const NAME_FIELD = 'Name';
const TITLE_FIELD = 'Title';

export interface WorkspaceTreeItem {
  id: string;
  label: string;
  isCollection: boolean;
  isWorkspace: boolean;
  children?: WorkspaceTreeItem[];
  workspaceId?: string;
  image?: string;
}

export const getWorkspaceTree = async (
  commonDb: CommonIDBWrapper
): Promise<WorkspaceTreeItem[]> => {
  const workspaces: Workspace[] = await getWorkspaces(commonDb);
  workspaces.unshift({
    WorkspaceID: DEFAULT_DB,
    Name: DICTIONARY.labels.localWorkspace,
    UserID: DEFAULT_USER_ID,
    Plan: FREE_PLAN,
    PaidSeats: 0,
    CreatedAt: new Date(0),
  });

  const tree = await Promise.all(
    sortBy(workspaces, NAME_FIELD).map(async (workspace) => {
      let collections: ChainCollection[] = [];
      const workspaceDatabase = (await initIDB(
        workspace.WorkspaceID
      )) as IDBPDatabase;

      if (workspaceDatabase) {
        const workspaceDb = new IDBWrapper(
          workspaceDatabase,
          workspace.WorkspaceID
        );

        collections = await getChainCollections(workspaceDb);
        workspaceDb.close();
      }

      return {
        id: workspace.WorkspaceID,
        label: workspace.Name,
        isCollection: false,
        isWorkspace: true,
        image: workspace.Image,
        children: sortBy(collections, TITLE_FIELD).map((collection) => ({
          id: collection.CollectionID,
          label: collection.Title,
          isCollection: true,
          isWorkspace: false,
          workspaceId: workspace.WorkspaceID,
        })),
      };
    })
  );
  return tree;
};

export const filterTree = (
  items: WorkspaceTreeItem[],
  keyword: string
): WorkspaceTreeItem[] => {
  return items.reduce<WorkspaceTreeItem[]>((filtered, item) => {
    const matchesKeyword = item.label
      .toLowerCase()
      .includes(keyword.toLowerCase());

    if (matchesKeyword) {
      filtered.push(item);
    } else if (item.children) {
      const filteredChildren = filterTree(item.children, keyword);
      if (filteredChildren.length > 0) {
        filtered.push({
          ...item,
          children: filteredChildren,
        });
      }
    }

    return filtered;
  }, []);
};
