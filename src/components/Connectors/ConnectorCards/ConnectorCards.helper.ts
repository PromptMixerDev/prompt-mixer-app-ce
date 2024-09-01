import { PromptMixerConnector } from 'http/connectors';
import { type IConnector } from '../../ModelsSelector';

export const mapToConnectors = (
  data: PromptMixerConnector[] | null
): IConnector[] => {
  if (!data?.length) {
    return [];
  }

  return data.map((item: PromptMixerConnector) => ({
    connectorFolder: item.slug,
    connectorName: item.name,
    models: [],
    settings: [],
    description: item.description,
    author: item.developer,
    updated: item.updated,
    link: item.link,
    tags: item.tags,
    connectorVersion: item.latest_version,
  }));
};
