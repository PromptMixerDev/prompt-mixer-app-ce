import React from 'react';
import { DICTIONARY } from 'dictionary';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  CONNECTORS_TAB_SET_ID,
  TabSetOrder,
  tabMap,
} from '../../FlexLayout/FlexLayout.config';
import { Tabs } from '../../Connectors';
import { addNewTabsHandler } from '../../FlexLayout/FlexLayout.helper';
import styles from './ErrorSteps.module.css';

export const ErrorSteps: React.FC = () => {
  const dispatch = useAppDispatch();
  const { model } = useAppSelector((state) => state.flexLayoutModel);
  const handleClick = (): void =>
    addNewTabsHandler(
      [
        {
          tabNodeJson: {
            ...tabMap.connectorsTab,
            config: {
              ...tabMap.connectorsTab.config,
              tab: Tabs.installed,
            },
          },
          tabSetId: CONNECTORS_TAB_SET_ID,
          tabSetOrder: TabSetOrder.connectors,
        },
      ],
      model,
      dispatch
    );
  return (
    <div className={styles.errorSteps}>
      <div>{DICTIONARY.outputError.trySteps}</div>
      <div>
        {DICTIONARY.outputError.checkConnectorStep}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          {DICTIONARY.outputError.checkConnector}
        </a>
      </div>
      <div>
        {DICTIONARY.outputError.checkDocumentationStep}
        <a href="https://docs.promptmixer.dev">
          {DICTIONARY.outputError.checkDocumentation}
        </a>
      </div>
      <div>
        {DICTIONARY.outputError.discordServerStep}
        <a href="https://discord.gg/cvs7RDBC9a">
          {DICTIONARY.outputError.discordServer}
        </a>
      </div>
    </div>
  );
};
