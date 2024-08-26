import { type IConnector } from '../../ModelsSelector';
import { type PromptMixerConnector } from './ConnectorCards';

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
  }));
};
