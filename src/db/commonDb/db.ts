import { openDB, type IDBPDatabase } from 'idb';
import {
  type DBConfig,
  type CommonDBSchema,
  DBStores,
  DBKeyPathes,
} from './db.types';
import { FREE_PLAN } from './db.helpers';

const COMMON_DB_NAME = 'prompt-mixer-common';

const dbConfig: DBConfig = {
  name: COMMON_DB_NAME,
  version: 2,
};

export const initCommonIDB =
  async (): Promise<IDBPDatabase<CommonDBSchema> | null> => {
    try {
      const db = await openDB<CommonDBSchema>(dbConfig.name, dbConfig.version, {
        upgrade(database, oldVersion, newVersion, transaction) {
          if (oldVersion < 1) {
            database
              .createObjectStore(DBStores.workspace, {
                keyPath: DBKeyPathes.workspaceID,
                autoIncrement: true,
              })
              .createIndex(DBKeyPathes.userID, DBKeyPathes.userID, {
                unique: false,
              });
          }
          if (oldVersion < 2) {
            (async () => {
              const workspaceStore = transaction.objectStore(
                DBStores.workspace
              );
              let cursor = await workspaceStore.openCursor();
              while (cursor) {
                const workspace = cursor.value;
                if (workspace.Plan === 'free') {
                  workspace.Plan = FREE_PLAN;
                  await cursor.update(workspace);
                }
                cursor = await cursor.continue();
              }
            })();
          }
        },
      });
      return db;
    } catch (error: any) {
      console.error(`Error initializing IndexedDB: ${error}`);
      return null;
    }
  };
