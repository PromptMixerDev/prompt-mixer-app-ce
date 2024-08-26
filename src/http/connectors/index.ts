import { CONNECTORS_URL } from 'http/endpoints';
import { httpClient } from 'http/httpClient';

export interface PromptMixerConnector {
  slug: string;
  name: string;
  developer: string;
  updated: string;
  description: string;
  link: string;
  tags: string[] | null;
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
