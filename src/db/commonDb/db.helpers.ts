import { v4 as uuidv4 } from 'uuid';
import { DBStores, type IDBWrapper, type Workspace } from 'db/commonDb';

export const FREE_PLAN = 'Free';

export const createWorkspace = async (
  db: IDBWrapper,
  id: string,
  name: string,
  userId: string,
  imageDataUrl?: string,
  plan?: string,
  paidSeats?: number
): Promise<Workspace> => {
  const date = new Date();
  const newWorkspace: Workspace = {
    WorkspaceID: id ?? uuidv4(),
    Name: name,
    UserID: userId,
    CreatedAt: date,
    UpdatedAt: date,
    Image: imageDataUrl,
    Plan: plan ?? FREE_PLAN,
    PaidSeats: paidSeats ?? 0,
  };
  await db.add(DBStores.workspace, newWorkspace);

  return newWorkspace;
};

export const getWorkspace = async (
  db: IDBWrapper,
  id: string
): Promise<Workspace | undefined> => {
  const workspace = await db.get(DBStores.workspace, id);
  return workspace;
};

export const getWorkspaces = async (db: IDBWrapper): Promise<Workspace[]> => {
  const workspaces = await db.getAll(DBStores.workspace);
  return workspaces;
};

export const updateWorkspace = async (
  db: IDBWrapper,
  id: string,
  workspace: Partial<Workspace>
): Promise<void> => {
  const workspaceToUpdate = await db.get(DBStores.workspace, id);
  if (workspaceToUpdate) {
    await db.update(DBStores.workspace, {
      ...workspaceToUpdate,
      ...workspace,
      UpdatedAt: new Date(),
    });
  }
};

export const deleteWorkspace = async (
  db: IDBWrapper,
  id: string
): Promise<void> => {
  await db.delete(DBStores.workspace, id);
};
