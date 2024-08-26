import React, { useContext, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useLocalStorageState } from 'hooks';
import { DICTIONARY } from 'dictionary';
import { DEFAULT_DB } from 'db/workspaceDb';
import { getWorkspaces, Workspace } from 'db/commonDb';
import { resetStore } from 'store/store';
import { ReactComponent as PropertyIcon } from 'assets/icons/property.svg';
import { Button, ButtonTypes } from '../../Button';
import { type AlignValues, ContextMenu } from '../../Modals/ContextMenu';
import { type ContextMenuOption } from '../../Modals/ContextMenuWithOptions';
import { WorkspaceImage } from '../../Forms/CreateWorkspaceForm/WorkspaceImage';
import {
  addNewTabsHandler,
  resetLayout,
  type TabInfo,
} from '../../FlexLayout/FlexLayout.helper';
import {
  PROMPT_EDITOR_TAB_SET_ID,
  TabSetOrder,
  tabMap,
} from '../../FlexLayout/FlexLayout.config';
import { Spinner } from '../../Spinner';
import styles from './WorkspacesContextMenu.module.css';
import { CommonDatabaseContext } from 'contexts';

interface WorkspacesContextMenuProps {
  options: ContextMenuOption[];
  onClose: () => void;
  align?: AlignValues;
  triggerRef?: React.RefObject<HTMLElement>;
  ignoreElementRef?: React.RefObject<HTMLElement>;
  setActiveWorkspaceId: (value: string) => void;
  resetWorkspaceDb: () => void;
}

export const localWorkspace = {
  Name: DICTIONARY.labels.localWorkspace,
  WorkspaceID: DEFAULT_DB,
  Image: undefined,
};

export const WorkspacesContextMenu: React.FC<WorkspacesContextMenuProps> = ({
  options,
  onClose,
  align,
  triggerRef,
  ignoreElementRef,
  setActiveWorkspaceId,
  resetWorkspaceDb,
}) => {
  const commonDb = useContext(CommonDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { model } = useAppSelector((store) => store.flexLayoutModel);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeWorkspaceId] = useLocalStorageState(
    'activeWorkspaceId',
    DEFAULT_DB as string
  );

  useEffect(() => {
    setIsLoading(true);
    getWorkspaces(commonDb)
      .then((workspaces) => {
        setWorkspaces(workspaces);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setIsLoading(false);
      });
  }, []);

  const onWorkspaceItemClick = (
    workspaceId: string,
    tabs?: TabInfo[]
  ): void => {
    resetLayout(dispatch, tabs);
    setActiveWorkspaceId(workspaceId);
    resetWorkspaceDb();
    resetStore();
    onClose();
  };

  const onWorkspaceSettingsClick = (
    e: React.MouseEvent,
    workspace: Partial<Workspace>
  ): void => {
    e.stopPropagation();
    const tabs = [
      {
        tabNodeJson: {
          ...tabMap.workspaceSettingsTab,
          id: workspace.WorkspaceID,
          name: workspace.Name,
          config: {
            ...tabMap.workspaceSettingsTab.config,
            image: workspace.Image,
          },
        },
        tabSetId: PROMPT_EDITOR_TAB_SET_ID,
        tabSetOrder: TabSetOrder.promptChain,
      },
    ];
    if (workspace.WorkspaceID !== activeWorkspaceId) {
      onWorkspaceItemClick(workspace.WorkspaceID!, tabs);
    } else {
      addNewTabsHandler(tabs, model, dispatch);
    }
  };

  const workspacesOptions = [...workspaces, localWorkspace].map(
    (workspace, ind) => (
      <div
        key={ind}
        className={styles.workspaceItem}
        onClick={() => {
          if (workspace.WorkspaceID !== activeWorkspaceId) {
            onWorkspaceItemClick(workspace.WorkspaceID);
          }
        }}
      >
        <WorkspaceImage
          name={workspace.Name}
          imagePreview={workspace.Image}
          imageClass={styles.image}
          imagePlaceholderClass={styles.imagePlaceholder}
          isDefault={workspace.WorkspaceID === DEFAULT_DB}
        />
        <div className={styles.workspaceInfo}>
          <div className={styles.workspaceName}>{workspace.Name}</div>
        </div>
        {workspace.WorkspaceID !== DEFAULT_DB && (
          <Button
            type={ButtonTypes.icon}
            buttonWrapperClass={styles.settingButton}
            onClick={(e: React.MouseEvent): void =>
              onWorkspaceSettingsClick(e, workspace as Partial<Workspace>)
            }
          >
            <PropertyIcon />
          </Button>
        )}
      </div>
    )
  );

  return (
    <ContextMenu
      onClose={onClose}
      align={align}
      triggerRef={triggerRef}
      ignoreElementRef={ignoreElementRef}
    >
      <div className={styles.wrapper}>
        {isLoading && <Spinner />}
        {!!workspacesOptions.length && (
          <div className={styles.group}>{workspacesOptions}</div>
        )}
        <div className={styles.group}>
          {options.map((option, index) => {
            const Icon = option.icon;
            return (
              <div
                key={index}
                className={styles.menuItem}
                onClick={(e) => {
                  option.onClick(e);
                  onClose();
                }}
              >
                {Icon && <Icon className={styles.menuItemIcon} />}
                {option.label}
              </div>
            );
          })}
        </div>
      </div>
    </ContextMenu>
  );
};
