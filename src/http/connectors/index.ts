import { CONNECTOR_URL, CONNECTORS_URL } from 'http/endpoints';
import { httpClient } from 'http/httpClient';

export interface PromptMixerConnector {
  slug: string;
  name: string;
  developer: string;
  updated: string;
  description: string;
  link: string;
  tags: string[] | null;
  latest_version: string;
}

export interface ConnectorsResponse {
  connectors: PromptMixerConnector[];
  total_connectors: number;
  page: number;
  limit: number;
}

export const getConnectors = async (
  page: number,
  limit: number,
  searchKey: string
): Promise<ConnectorsResponse> => {
  try {
    const url = `${CONNECTORS_URL}?search=${searchKey}&page=${page}&limit=${limit}`;
    return await httpClient(url);
  } catch (error) {
    console.error('Failed to get connectors:', error);
    throw new Error('Failed to get connectors');
  }
};

const getConnectorById = async (id: string): Promise<PromptMixerConnector> => {
  try {
    const url = `${CONNECTOR_URL}/${id}`;
    return await httpClient(url);
  } catch (error) {
    console.error('Failed to get connector by id:', error);
    throw new Error('Failed to get connector by id');
  }
};

export const getConnectorsByIds = async (
  ids: string[]
): Promise<PromptMixerConnector[]> => {
  try {
    const res = await Promise.all(ids.map((id) => getConnectorById(id)));
    return res;
  } catch (error) {
    console.error('Failed to get connectors by ids:', error);
    throw new Error('Failed to get connectors by ids');
  }
};
