import { openDB, type IDBPDatabase } from 'idb';
import {
  type DBConfig,
  type PromptMixerDBSchema,
  DBStores,
  DBKeyPathes,
} from './db.types';

export const DEFAULT_DB = 'prompt-mixer';
export const DEFAULT_USER_ID = 'prompt-mixer-user';

const dbConfig: DBConfig = {
  version: 15,
};

export const initIDB = async (
  dbName: string
): Promise<IDBPDatabase<PromptMixerDBSchema> | null> => {
  try {
    const db = await openDB<PromptMixerDBSchema>(dbName, dbConfig.version, {
      upgrade(database, oldVersion, newVersion, transaction) {
        if (oldVersion < 1) {
          database.createObjectStore(DBStores.chainCollection, {
            keyPath: DBKeyPathes.collectionID,
            autoIncrement: true,
          });
          database.createObjectStore(DBStores.promptChain, {
            keyPath: DBKeyPathes.chainID,
            autoIncrement: true,
          });
          database
            .createObjectStore(DBStores.prompt, {
              keyPath: DBKeyPathes.promptID,
              autoIncrement: true,
            })
            .createIndex(DBKeyPathes.chainID, DBKeyPathes.chainID, {
              unique: false,
            });
          database
            .createObjectStore(DBStores.promptVersion, {
              keyPath: DBKeyPathes.versionID,
              autoIncrement: true,
            })
            .createIndex(DBKeyPathes.promptID, DBKeyPathes.promptID, {
              unique: false,
            });
        }
        if (oldVersion < 2) {
          const promptChainStore = transaction.objectStore(
            DBStores.promptChain
          );
          promptChainStore.createIndex(
            DBKeyPathes.collectionID,
            DBKeyPathes.collectionID,
            { unique: false }
          );
        }
        if (oldVersion < 3) {
          database
            .createObjectStore(DBStores.output, {
              keyPath: DBKeyPathes.outputID,
              autoIncrement: true,
            })
            .createIndex(DBKeyPathes.chainID, DBKeyPathes.chainID, {
              unique: false,
            });
        }
        if (oldVersion < 4) {
          database
            .createObjectStore(DBStores.chainModel, {
              keyPath: DBKeyPathes.chainModelID,
              autoIncrement: true,
            })
            .createIndex(DBKeyPathes.chainID, DBKeyPathes.chainID, {
              unique: false,
            });
        }
        if (oldVersion < 5) {
          database.createObjectStore(DBStores.connectorSettings, {
            keyPath: DBKeyPathes.connectorFolder,
            autoIncrement: true,
          });
        }
        if (oldVersion < 6) {
          const chainModelStore = transaction.objectStore(DBStores.chainModel);
          chainModelStore.createIndex(
            DBKeyPathes.connectorFolder,
            DBKeyPathes.connectorFolder,
            { unique: false }
          );
        }
        if (oldVersion < 7) {
          (async () => {
            const outputStore = transaction.objectStore(DBStores.output);
            let cursor = await outputStore.openCursor();
            while (cursor) {
              const output = cursor.value;
              if (Array.isArray(output.PromptVersions)) {
                if (
                  output.PromptVersions.length > 0 &&
                  typeof output.PromptVersions[0] === 'number'
                ) {
                  const oldPromptVersions =
                    output.PromptVersions as unknown as number[];
                  output.PromptVersions = oldPromptVersions.map(
                    (value, index) => [index + 1, value] as [number, number]
                  );
                }
              }
              await cursor.update(output);
              cursor = await cursor.continue();
            }
          })();
        }
        if (oldVersion < 8) {
          (async () => {
            const outputStore = transaction.objectStore(DBStores.output);
            let cursor = await outputStore.openCursor();
            while (cursor) {
              const output = cursor.value;
              output.CompletedAt = output.UpdatedAt;
              await cursor.update(output);
              cursor = await cursor.continue();
            }
          })();
        }
        if (oldVersion < 9) {
          database
            .createObjectStore(DBStores.dataset, {
              keyPath: DBKeyPathes.datasetID,
              autoIncrement: true,
            })
            .createIndex(DBKeyPathes.collectionID, DBKeyPathes.collectionID, {
              unique: false,
            });
        }
        if (oldVersion < 10) {
          database.createObjectStore(DBStores.changeLogItem, {
            keyPath: DBKeyPathes.changeLogItemID,
            autoIncrement: true,
          });
        }
        if (oldVersion < 11) {
          database
            .createObjectStore(DBStores.variable, {
              keyPath: DBKeyPathes.variableID,
              autoIncrement: true,
            })
            .createIndex(DBKeyPathes.chainID, DBKeyPathes.chainID, {
              unique: false,
            });
        }
        if (oldVersion < 12) {
          database
            .createObjectStore(DBStores.workflow, {
              keyPath: DBKeyPathes.workflowID,
              autoIncrement: true,
            })
            .createIndex(DBKeyPathes.collectionID, DBKeyPathes.collectionID, {
              unique: false,
            });
        }
        if (oldVersion < 13) {
          database
            .createObjectStore(DBStores.workflowOutput, {
              keyPath: DBKeyPathes.outputID,
              autoIncrement: true,
            })
            .createIndex(DBKeyPathes.workflowID, DBKeyPathes.workflowID, {
              unique: false,
            });
        }
        if (oldVersion < 14) {
          if (database.objectStoreNames.contains(DBStores.changeLogItem)) {
            database.deleteObjectStore(DBStores.changeLogItem);
          }
        }
        if (oldVersion < 15) {
          const promptVersionStore = transaction.objectStore(
            DBStores.promptVersion
          );
          promptVersionStore.createIndex(
            DBKeyPathes.content,
            DBKeyPathes.content,
            {
              unique: false,
            }
          );
        }
      },
    });
    return db;
  } catch (error: any) {
    console.error(`Error initializing IndexedDB: ${error}`);
    return null;
  }
};
