import { type IDBPDatabase } from 'idb';
import { DICTIONARY } from 'dictionary';
import { type IDBWrapper as CommonIDBWrapper } from 'db/commonDb';
import {
  DBStores,
  IDBWrapper,
  deletePromptChain,
  getChainModels,
  getOutputsByChainId,
  getPromptById,
  getPromptChainById,
  getPromptVersionsById,
  initIDB,
  updatePromptChain,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import { processChainDeletion } from '../../Workflow/WorkflowArea/WorkflowArea.helper';

export const getConfimationText = (
  chainName: string,
  name: string,
  isWorkspace: boolean
): string =>
  DICTIONARY.questions.areYouWantToMoveChain
    .replace('<CnainName>', chainName)
    .replace('<Entity>', isWorkspace ? 'workspce' : 'collection')
    .replace('<EntityName>', name);

export const moveChain = async (
  db: IDBWrapper,
  commonDb: CommonIDBWrapper,
  chainId: string,
  activeWorkspaceId: string,
  workspaceId: string,
  collectionId: string | undefined,
  dispatch: AppDispatch
): Promise<void> => {
  if (activeWorkspaceId === workspaceId) {
    await updatePromptChain(db, chainId, {
      CollectionID: collectionId,
    });
    return;
  }
  const workspaceDatabase = (await initIDB(workspaceId)) as IDBPDatabase;
  const workspaceDb = new IDBWrapper(workspaceDatabase, workspaceId);

  const promptChain = await getPromptChainById(db, chainId);
  const prompts = await Promise.all(
    promptChain.Prompts.map(async (id) => await getPromptById(db, id))
  );
  const versions = (
    await Promise.all(
      prompts.map(
        async (prompt) => await getPromptVersionsById(db, prompt.PromptID)
      )
    )
  ).flat();
  const chainModels = await getChainModels(db, chainId);
  const outputs = await getOutputsByChainId(db, chainId);

  const date = new Date();
  await workspaceDb.add(DBStores.promptChain, {
    ...promptChain,
    CollectionID: collectionId,
    CreatedAt: date,
    UpdatedAt: date,
  });

  await Promise.all(
    prompts.map(async (prompt) => {
      await workspaceDb.add(DBStores.prompt, {
        ...prompt,
        CreatedAt: date,
        UpdatedAt: date,
      });
    })
  );
  await Promise.all(
    versions.map(async (version) => {
      await workspaceDb.add(DBStores.promptVersion, {
        ...version,
        CreatedAt: date,
        UpdatedAt: date,
      });
    })
  );
  await Promise.all(
    chainModels.map(async (chainModel) => {
      await workspaceDb.add(DBStores.chainModel, {
        ...chainModel,
        CreatedAt: date,
        UpdatedAt: date,
      });
    })
  );
  await Promise.all(
    outputs.map(async (output) => {
      await workspaceDb.add(DBStores.output, {
        ...output,
        CreatedAt: date,
        UpdatedAt: date,
      });
    })
  );
  workspaceDb.close();

  await deletePromptChain(db, chainId);
  processChainDeletion(db, chainId, dispatch);
};
