import React, {
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Layout, type TabNode } from 'flexlayout-react';
import { type OutputData, getAllSavedSettings } from 'db/workspaceDb';
import { NotificationsContext, WorkspaceDatabaseContext } from 'contexts';
import {
  type ThemeMode,
  useIpcRenderer,
  useAppDispatch,
  useAppSelector,
} from 'hooks';
import { DICTIONARY } from 'dictionary';
import {
  setInstalledConnectors,
  updateConnector,
} from 'store/connectors/connectorsSlice';
import { type IWorkflow } from 'store/workflow/workflowSlice';
import { onModelChange, tabRender } from './FlexLayout.helper';
import { LayoutComponents } from './FlexLayout.config';
import { Tree } from '../Tree';
import { PromptEditor } from '../PromptEditor';
import { Layout as Outputs } from '../Layout';
import { TitleBar } from '../TitleBar';
import { Tools } from '../Tools';
import { Settings } from '../Settings';
import { Dataset } from '../Dataset';
import { handleStuckOutputs } from '../Layout/Layout.helper';
import { Connectors } from '../Connectors';
import { type IConnector } from '../ModelsSelector';
import { NotificationTypes } from '../NotificationProvider/Notification';
import { readAndSetDatasets } from '../Dataset/Dataset.helper';
import { DatasetCellInfo } from '../Dataset/DatasetCellInfo';
import { WorkspaceSettings } from '../WorkspaceSettings';
import { Spinner } from '../Spinner';
import { Workflow } from '../Workflow';
import { handleUpdateOutput } from '../Layout/Output/Output.helper';
import { handleWorkflowOutput } from '../Workflow/Workflow.helper';
import 'flexlayout-react/style/light.css';
import './Flexlayout.custom.css';
import styles from './FlexLayout.module.css';

interface FlexLayoutProps {
  theme: ThemeMode;
  setThemeMode: (value: ThemeMode) => void;
  setActiveWorkspaceId: Dispatch<SetStateAction<string>>;
  resetWorkspaceDb: () => void;
}

export const FlexLayout: React.FC<FlexLayoutProps> = ({
  theme,
  setThemeMode,
  setActiveWorkspaceId,
  resetWorkspaceDb,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const sideBarRef = useRef<HTMLDivElement | null>(null);
  const [sideBarReady, setSideBarReady] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const { addNotification } = useContext(NotificationsContext)!;
  const dispatch = useAppDispatch();
  const { model: flexLayoutModel } = useAppSelector(
    (store) => store.flexLayoutModel
  );
  const modelChangeHandler = onModelChange(dispatch);

  const handleConnectorOutput = (
    outputId: string,
    model: string,
    value: Partial<OutputData>,
    workflow?: IWorkflow
  ): void => {
    if (!workflow) {
      handleUpdateOutput(db, outputId, model, value, dispatch);
    } else {
      handleWorkflowOutput(
        db,
        outputId,
        model,
        value,
        workflow,
        dispatch,
        send
      ).catch((error) => {
        console.error('handleWorkflowOutput error: ', error);
      });
    }
  };

  const { send } = useIpcRenderer(
    {
      'connector-output': handleConnectorOutput,
      'installed-connectors': (value: IConnector[]) => {
        dispatch(setInstalledConnectors(value));
      },
      'install-connector-success': () => {
        getAllSavedSettings(db)
          .then((res) => send('request-installed-connectors', res))
          .catch(console.error);

        addNotification(
          NotificationTypes.success,
          DICTIONARY.notifications.connectorInstalledSuccessfully
        );
      },
      'install-connector-failed': (error: any) => {
        console.error(error);
        addNotification(
          NotificationTypes.error,
          DICTIONARY.notifications.failedInstallConnector
        );
      },
      'remove-connector-success': () => {
        getAllSavedSettings(db)
          .then((res) => send('request-installed-connectors', res))
          .catch(console.error);

        addNotification(
          NotificationTypes.success,
          DICTIONARY.notifications.connectorRemovedSuccessfully
        );
      },
      'remove-connector-failed': (error: any) => {
        console.error(error);
        addNotification(
          NotificationTypes.error,
          DICTIONARY.notifications.failedRemoveConnector
        );
      },
      'update-connector-success': (value: IConnector) => {
        dispatch(updateConnector(value));
      },
      'update-connector-version-success': () => {
        getAllSavedSettings(db)
          .then((res) => send('request-installed-connectors', res))
          .catch(console.error);

        addNotification(
          NotificationTypes.success,
          DICTIONARY.notifications.connectorVersionUpdatedSuccessfully
        );
      },
      'update-connector-version-failed': (error: any) => {
        console.error(error);
        addNotification(
          NotificationTypes.error,
          DICTIONARY.notifications.failedUpdateConnectorVersion
        );
      },
      'setup-complete': () => setSetupComplete(true),
    },
    [db]
  );

  useEffect(() => {
    if (db) {
      handleStuckOutputs(db).catch((error) => {
        console.error(error);
      });
    }
  }, [db]);

  useEffect(() => {
    if (db) {
      getAllSavedSettings(db)
        .then((res) => send('request-installed-connectors', res))
        .catch(console.error);
      readAndSetDatasets(db, dispatch);
    }
  }, [db, setupComplete]);

  const factory = (node: TabNode): React.ReactNode => {
    const config = node.getConfig();
    const component = node.getComponent();

    switch (component) {
      case LayoutComponents.tree:
        return <Tree ref={sideBarRef} setSideBarReady={setSideBarReady} />;
      case LayoutComponents.promptEditor:
        return <PromptEditor tabId={node.getId()} chainId={config?.chainId} />;
      case LayoutComponents.output:
        return <Outputs />;
      case LayoutComponents.tools:
        return <Tools />;
      case LayoutComponents.settings:
        return <Settings setThemeMode={setThemeMode} theme={theme} />;
      case LayoutComponents.connectors:
        return <Connectors tab={config.tab} />;
      case LayoutComponents.dataset:
        return <Dataset tabId={node.getId()} datasetId={config?.datasetId} />;
      case LayoutComponents.datasetCellInfo:
        return (
          <DatasetCellInfo
            datasetId={config.datasetId}
            content={config.content}
            cellInfo={config.cellInfo}
          />
        );
      case LayoutComponents.workspaceSettings:
        return (
          <WorkspaceSettings
            workspaceId={node.getId()}
            setActiveWorkspaceId={setActiveWorkspaceId}
            resetWorkspaceDb={resetWorkspaceDb}
          />
        );
      case LayoutComponents.workflow:
        return <Workflow workflowId={config?.workflowId} />;
    }
  };

  return (
    <>
      <TitleBar
        sideBarRef={sideBarRef}
        sideBarReady={sideBarReady}
        setActiveWorkspaceId={setActiveWorkspaceId}
        resetWorkspaceDb={resetWorkspaceDb}
      />
      {db ? (
        <div className={styles.wrapper}>
          <Layout
            model={flexLayoutModel}
            factory={factory}
            onModelChange={modelChangeHandler}
            onRenderTab={tabRender(styles as Record<string, string>)}
          />
        </div>
      ) : (
        <Spinner />
      )}
    </>
  );
};
