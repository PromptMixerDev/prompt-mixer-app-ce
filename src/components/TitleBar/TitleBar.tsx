/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { v4 as uuidv4 } from 'uuid';
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  type SetStateAction,
  type Dispatch,
} from 'react';
import classNames from 'classnames';
import { ReactComponent as LayoutColumnIcon } from 'assets/icons/layout-column.svg';
import { ReactComponent as ArrowDownIcon } from 'assets/icons/arrow-right.svg';
import { DICTIONARY } from 'dictionary';
import { NotificationsContext, WorkspaceDatabaseContext } from 'contexts';
import { useAppDispatch, useAppSelector } from 'hooks';
import { DEFAULT_DB, searchPromptChainContent } from 'db/workspaceDb';
import { SearchField } from 'components/SearchField';
import {
  ContextMenuOption,
  ContextMenuWithOptions,
} from 'components/Modals/ContextMenuWithOptions';
import { Button, ButtonSize, ButtonTypes } from '../Button';
import { ControlButtons } from './ControlButtons';
import Modal from '../Modals/Modal/Modal';
import { CreateWorkspaceForm } from '../Forms/CreateWorkspaceForm';
import { WorkspaceImage } from '../Forms/CreateWorkspaceForm/WorkspaceImage';
import { AlignValues } from '../Modals/ContextMenu';
import { MIN_WIDTH } from '../FlexLayout/FlexLayout.config';
import {
  getAdditionalSearchOptions,
  getContextMenuOptions,
  getMainSearchOptions,
  handleSideBarElements,
  toggleSideBar,
} from './TitleBar.helper';
import { NotificationTypes } from '../NotificationProvider/Notification';
import { WorkspacesContextMenu } from './WorkspacesContextMenu';
import { resetLayout } from '../FlexLayout/FlexLayout.helper';
import styles from './TitleBar.module.css';

interface TitleBarProps {
  sideBarRef: React.RefObject<HTMLDivElement>;
  sideBarReady: boolean;
  setActiveWorkspaceId: Dispatch<SetStateAction<string>>;
  resetWorkspaceDb: () => void;
}

export interface SideBarElements {
  splitter: HTMLElement | null;
  flexlayout: HTMLElement | null;
}

export enum Modals {
  CREATE_WORKSPACE = 'createWorkspace',
}

const MIN_SEARCH_TEXT_SIZE = 3;

export const TitleBar: React.FC<TitleBarProps> = ({
  sideBarRef,
  sideBarReady,
  setActiveWorkspaceId,
  resetWorkspaceDb,
}): JSX.Element => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { model } = useAppSelector((store) => store.flexLayoutModel);
  const { activeWorkspace } = useAppSelector((store) => store.workspace);
  const { treeData } = useAppSelector((state) => state.tree);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const searchFieldRef = useRef<HTMLDivElement | null>(null);
  const activeWorkspaceId = activeWorkspace?.WorkspaceID;
  const activeWorkspaceName =
    activeWorkspaceId === DEFAULT_DB
      ? DICTIONARY.labels.localWorkspace
      : (activeWorkspace?.Name ?? DICTIONARY.labels.unknown);
  const { addNotification } = useContext(NotificationsContext)!;
  const [sideBarElements, setSideBarElements] = useState<SideBarElements>({
    splitter: null,
    flexlayout: null,
  });
  const [sideBarWidth, setSideBarWidth] = useState<number>(MIN_WIDTH);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<Modals | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [searchContextMenuVisible, setSearchContextMenuVisible] =
    useState(false);
  const [searchContextMenuOptions, setSearchContextMenuOptions] = useState<
    ContextMenuOption[][]
  >([]);
  const [
    additionalSearchContextMenuOptions,
    setAdditionalSearchContextMenuOptions,
  ] = useState<ContextMenuOption[][]>([]);
  const [searchFieldKey, setSearchFieldKey] = useState<string>(uuidv4());

  useEffect(() => {
    const splitterElement = document.querySelector<HTMLElement>(
      '[data-layout-path="/s0"]'
    );
    const flexlayoutElement = document.querySelector<HTMLElement>(
      '.flexlayout__layout'
    );
    const elements = {
      splitter: splitterElement,
      flexlayout: flexlayoutElement,
    };
    setSideBarElements(elements);
    if (sideBarRef.current) {
      const isOpen = sideBarRef.current.clientWidth > 0;
      handleSideBarElements(isOpen, elements);
    }
  }, [sideBarReady]);

  const handleCreateWorkspaceClick = (): void => {
    setModalContent(Modals.CREATE_WORKSPACE);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
  };

  const handleCreateWorkspaceSuccess = (id: string): void => {
    addNotification(
      NotificationTypes.success,
      DICTIONARY.notifications.workspaceCreatedSuccessfully
    );
    resetLayout(dispatch);
    setActiveWorkspaceId(id);
    resetWorkspaceDb();
    closeModal();
  };

  const handleWorkspacesClick = (): void => {
    setContextMenuVisible(!contextMenuVisible);
  };

  const closeContextMenu = (): void => {
    setContextMenuVisible(false);
  };

  const handleToggleSideBar = (): void => {
    toggleSideBar(
      sideBarRef,
      sideBarWidth,
      setSideBarWidth,
      sideBarElements,
      model
    );
  };

  const clearSearchOptions = (): void => {
    setSearchContextMenuOptions([]);
    setAdditionalSearchContextMenuOptions([]);
  };

  const handleSearch = async (text: string): Promise<void> => {
    if (text.length < MIN_SEARCH_TEXT_SIZE) {
      clearSearchOptions();
      return;
    }

    searchPromptChainContent(db, text)
      .then((results) => {
        const additionalOptions = getAdditionalSearchOptions(
          results,
          model,
          dispatch,
          setSearchFieldKey,
          clearSearchOptions
        );

        setAdditionalSearchContextMenuOptions(additionalOptions);
      })
      .catch((error) => {
        console.error(error);
      });
    const mainOptions = getMainSearchOptions(
      treeData,
      text.toLowerCase(),
      model,
      dispatch,
      setSearchFieldKey,
      clearSearchOptions
    );

    setSearchContextMenuOptions(mainOptions);
  };

  return (
    <div className={styles.wrapper}>
      <ControlButtons />
      <div className={styles.buttons}>
        <Button
          type={ButtonTypes.icon}
          size={ButtonSize.m}
          onClick={handleToggleSideBar}
        >
          <LayoutColumnIcon />
        </Button>
        <Button
          ref={buttonRef}
          type={ButtonTypes.iconText}
          size={ButtonSize.m}
          onClick={handleWorkspacesClick}
          buttonClass={styles.workspaceButton}
        >
          <WorkspaceImage
            imagePreview={activeWorkspace?.Image}
            name={activeWorkspaceName}
            isDefault={activeWorkspaceId === DEFAULT_DB}
            imageClass={styles.image}
            imagePlaceholderClass={styles.imagePlaceholder}
          />
          <span className={styles.workspaceName}>{activeWorkspaceName}</span>
          <ArrowDownIcon
            className={classNames(
              styles.arrowIcon,
              contextMenuVisible && styles.expanded
            )}
          />
        </Button>
        {contextMenuVisible && (
          <WorkspacesContextMenu
            options={getContextMenuOptions(handleCreateWorkspaceClick)}
            onClose={closeContextMenu}
            align={AlignValues.UNDER}
            triggerRef={buttonRef}
            ignoreElementRef={buttonRef}
            setActiveWorkspaceId={setActiveWorkspaceId}
            resetWorkspaceDb={resetWorkspaceDb}
          />
        )}
      </div>
      <SearchField
        ref={searchFieldRef}
        key={searchFieldKey}
        onSearch={handleSearch}
        searchFieldClass={styles.searchField}
        onClick={() => {
          setSearchContextMenuVisible(true);
        }}
      />
      {searchContextMenuVisible && (
        <ContextMenuWithOptions
          optionGroups={[
            ...searchContextMenuOptions,
            ...additionalSearchContextMenuOptions,
          ]}
          onClose={() => {
            setSearchContextMenuVisible(false);
          }}
          triggerRef={searchFieldRef}
          align={AlignValues.UNDER}
          offset={0}
          contextMenuClass={styles.searchContextMenu}
          placeholder={DICTIONARY.placeholders.typeToSearch}
        />
      )}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {modalContent === Modals.CREATE_WORKSPACE && (
          <CreateWorkspaceForm
            onCreateWorkspaceSuccess={handleCreateWorkspaceSuccess}
          />
        )}
      </Modal>
    </div>
  );
};
