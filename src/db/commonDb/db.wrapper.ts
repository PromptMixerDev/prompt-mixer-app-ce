import { type IDBPDatabase } from 'idb';
import { type DBStores, type DBValue, type DBKeyPathes } from './db.types';

export class IDBWrapper {
  constructor(private readonly db: IDBPDatabase) {}

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
}
