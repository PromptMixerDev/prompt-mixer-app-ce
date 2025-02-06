import { type IDBPDatabase, deleteDB } from 'idb';
import { type DBStores, type DBValue, type DBKeyPathes } from './db.types';

export class IDBWrapper {
  constructor(
    private readonly db: IDBPDatabase,
    private readonly dbName: string
  ) {}

  async add(store: DBStores, value: DBValue): Promise<IDBValidKey> {
    return await this.db.add(store, value);
  }

  async get(
    store: DBStores,
    key: string | IDBKeyRange
  ): Promise<DBValue | undefined> {
    return await this.db.get(store, key);
  }

  async getFirst(store: DBStores): Promise<DBValue | undefined> {
    const result = await this.db.getAll(store, undefined, 1);
    return result[0];
  }

  async getAll(store: DBStores): Promise<DBValue[]> {
    return await this.db.getAll(store);
  }

  async update(store: DBStores, value: DBValue): Promise<IDBValidKey> {
    return await this.db.put(store, value);
  }

  async delete(store: DBStores, key: string | IDBKeyRange): Promise<void> {
    await this.db.delete(store, key);
  }

  async getAllFromIndex(
    store: DBStores,
    indexName: DBKeyPathes,
    indexValue: string | IDBKeyRange
  ): Promise<DBValue[]> {
    const objStore = this.db.transaction(store).store;
    const index = objStore.index(indexName);
    return await index.getAll(indexValue);
  }

  async searchItems(
    store: DBStores,
    indexName: DBKeyPathes,
    searchTerm: string
  ): Promise<DBValue[]> {
    const transaction = this.db.transaction(store, 'readonly');
    const objStore = transaction.objectStore(store);
    const index = objStore.index(indexName);
    const results: DBValue[] = [];

    const textRange = IDBKeyRange.bound(searchTerm, searchTerm + '\uffff');

    try {
      let cursor = await index.openCursor(textRange);

      while (cursor) {
        results.push(cursor.value);
        cursor = await cursor.continue();
      }

      return results;
    } catch (error) {
      console.error('Error occurred while searching:', error);
      throw error;
    }
  }

  async deleteDatabase(): Promise<void> {
    this.db.close();
    await deleteDB(this.dbName);
  }

  close(): void {
    this.db.close();
  }
}
