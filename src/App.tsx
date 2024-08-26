import React, { useState, useEffect, useContext } from 'react';
import { type IDBPDatabase } from 'idb';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { initIDB, IDBWrapper, DEFAULT_DB } from 'db/workspaceDb';
import {
  initCommonIDB,
  IDBWrapper as CommonIDBWrapper,
  getWorkspace,
} from 'db/commonDb';
import {
  useAppDispatch,
  useAppSelector,
  useIpcRenderer,
  useLocalStorageState,
  useScrollVisibility,
  useThemeMode,
} from 'hooks';
import { DICTIONARY } from 'dictionary';
import {
  WorkspaceDatabaseContext,
  CommonDatabaseContext,
  NotificationsContext,
} from 'contexts';
import { type ProgressInfo } from 'electron-updater';
import { setActiveWorkspace } from 'store/workspace/workspaceSlice';
import { Spinner } from 'components/Spinner';
import { FlexLayout } from 'components/FlexLayout';
import { localWorkspace } from 'components/TitleBar/WorkspacesContextMenu';
import { NotificationTypes } from 'components/NotificationProvider/Notification';
import { ProgressBarModal } from 'components/ProgressBarModal';
import { resetLayout } from 'components/FlexLayout/FlexLayout.helper';
import './App.css';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeWorkspace } = useAppSelector((store) => store.workspace);
  const { addNotification } = useContext(NotificationsContext)!;
  const [workspaceDb, setWorkspaceDb] = useState<IDBWrapper | null>(null);
  const [commonDb, setCommonDb] = useState<CommonIDBWrapper | null>(null);
  const { theme, setThemeMode } = useThemeMode();
  const [activeWorkspaceId, setActiveWorkspaceId] = useLocalStorageState(
    'activeWorkspaceId',
    DEFAULT_DB as string
  );
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const resetWorkspaceDb = (): void => {
    setWorkspaceDb(null);
  };

  const handleDownloadProgress = (value: ProgressInfo): void => {
    setProgressInfo(value);
    setIsModalVisible(true);
  };

  const handleUpdateError = (error: any): void => {
    setProgressInfo(null);
    setIsModalVisible(false);
    console.error('Error updating application: ', error);
    addNotification(
      NotificationTypes.error,
      DICTIONARY.notifications.failedToUpdateApp
    );
  };

  const handleUpdateDeferred = (): void => {
    addNotification(
      NotificationTypes.success,
      DICTIONARY.notifications.nextLaunchUpdate
    );
  };

  useIpcRenderer({
    'download-progress': handleDownloadProgress,
    'update-error': handleUpdateError,
    'update-deferred': handleUpdateDeferred,
  });

  useScrollVisibility();

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    (async () => {
      const commonDatabase = (await initCommonIDB()) as IDBPDatabase;
      if (commonDatabase) {
        const commonDb = new CommonIDBWrapper(commonDatabase);
        setCommonDb(commonDb);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (activeWorkspaceId && commonDb) {
          if (activeWorkspaceId === DEFAULT_DB) {
            dispatch(setActiveWorkspace(localWorkspace));
            return;
          }
          if (activeWorkspaceId !== DEFAULT_DB) {
            const workspace = await getWorkspace(commonDb, activeWorkspaceId);
            if (workspace) {
              dispatch(setActiveWorkspace(workspace));
            } else {
              resetLayout(dispatch);
              setActiveWorkspaceId(DEFAULT_DB);
            }
          }
        }
      } catch (error) {
        addNotification(
          NotificationTypes.error,
          DICTIONARY.notifications.failedLoadWorkspace
        );
        console.error(error);
        resetLayout(dispatch);
        setActiveWorkspaceId(DEFAULT_DB);
      }
    })();
  }, [activeWorkspaceId, commonDb]);

  useEffect(() => {
    (async () => {
      if (activeWorkspace) {
        const workspaceDatabase = (await initIDB(
          activeWorkspaceId
        )) as IDBPDatabase;

        if (workspaceDatabase) {
          const workspaceDb = new IDBWrapper(
            workspaceDatabase,
            activeWorkspaceId
          );
          setWorkspaceDb(workspaceDb);
        }
      }
    })();
  }, [activeWorkspace]);

  return (
    <DndProvider backend={HTML5Backend}>
      <CommonDatabaseContext.Provider value={commonDb}>
        <>
          {commonDb ? (
            <WorkspaceDatabaseContext.Provider value={workspaceDb}>
              <FlexLayout
                setThemeMode={setThemeMode}
                theme={theme}
                setActiveWorkspaceId={setActiveWorkspaceId}
                resetWorkspaceDb={resetWorkspaceDb}
              />
            </WorkspaceDatabaseContext.Provider>
          ) : (
            <Spinner height="100vh" />
          )}
          {isModalVisible && progressInfo && (
            <ProgressBarModal progressInfo={progressInfo} />
          )}
        </>
      </CommonDatabaseContext.Provider>
    </DndProvider>
  );
};

export default App;
