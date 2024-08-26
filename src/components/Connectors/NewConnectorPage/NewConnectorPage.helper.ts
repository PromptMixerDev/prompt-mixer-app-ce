import { DICTIONARY } from 'dictionary';
import { NotificationTypes } from '../../NotificationProvider/Notification';

const NAME_ID = 'name';
const GITHUB_LINK = 'github_link';

export interface Setting {
  id: string;
  label: string;
  value: string;
}

export const getSettings = (): Setting[] => [
  {
    id: NAME_ID,
    label: DICTIONARY.labels.name,
    value: '',
  },
  {
    id: GITHUB_LINK,
    label: DICTIONARY.labels.githubLink,
    value: '',
  },
];

export const getName = (settings: Setting[]): string | undefined =>
  settings.find((el) => el.id === NAME_ID)?.value;

export const getLink = (settings: Setting[]): string | undefined =>
  settings.find((el) => el.id === GITHUB_LINK)?.value;

export const addConnector = (
  name: string,
  link: string,
  addNotification: (type: NotificationTypes, message: string) => void,
  send: (channel: string, ...args: any[]) => void,
  setNewConnectorOpened: (value: boolean) => void
): void => {
  addNotification(
    NotificationTypes.success,
    DICTIONARY.notifications.installingConnector
  );
  send('install-connector', name, link);
  setNewConnectorOpened(false);
};

export const getConfimationText = (name: string): string =>
  DICTIONARY.questions.doYouWantToOverwriteConnector.replace('<Name>', name);
