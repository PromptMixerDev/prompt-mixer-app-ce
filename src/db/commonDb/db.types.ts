import { type DBSchema } from 'idb';

export interface Workspace {
  WorkspaceID: string;
  Name: string;
  UserID: string;
  Image?: string;
  Plan: string;
  PaidSeats: number;
  CreatedAt: Date;
  UpdatedAt?: Date;
}

export type DBValue = Workspace;

export interface CommonDBSchema extends DBSchema {
  Workspace: {
    key: string;
    value: Workspace;
    indexes: { UserID: string };
  };
}

export enum DBStores {
  workspace = 'Workspace',
}

export enum DBKeyPathes {
  workspaceID = 'WorkspaceID',
  userID = 'UserID',
}

export interface DBConfig {
  name: string;
  version?: number;
}
