import React, { type ReactElement } from 'react';
import { ReactComponent as FileTextIcon } from 'assets/icons/file-text.svg';
import { ReactComponent as SettingsIcon } from 'assets/icons/settings.svg';
import { ReactComponent as OutputIcon } from 'assets/icons/output.svg';
import { ReactComponent as DatasetIcon } from 'assets/icons/dataset-purple.svg';
import { ReactComponent as DatasetCellIcon } from 'assets/icons/dataset-blue.svg';
import { ReactComponent as WorkflowIcon } from 'assets/icons/workflow.svg';
import { ReactComponent as ConnectorsIcon } from 'assets/icons/pazzle.svg';
import {
  Actions,
  DockLocation,
  type IJsonTabNode,
  type IJsonTabSetNode,
  type ITabRenderValues,
  Model,
  type TabNode,
  type TabSetNode,
  type IJsonModel,
  type Action,
} from 'flexlayout-react';
import {
  DEFAULT_DB,
  createDataset,
  createNewChain,
  createWorkflow,
  type IDBWrapper,
} from 'db/workspaceDb';
import { type AppDispatch } from 'store/store';
import {
  EntityType,
  setSelectedEntity,
} from 'store/selectedEntity/selectedEntitySlice';
import { setModel } from 'store/flexLayoutModel/flexLayoutModelSlice';
import {
  generateDefaultJson,
  tabSetMap,
  LayoutComponentNames,
  PROMPT_EDITOR_TAB_SET_ID,
  TabSetOrder,
  tabMap,
  TabIcons,
  OUTPUTS_TAB_SET_ID,
  PROMPT_CHAIN_TAB_TYPE,
  DATASET_TAB_TYPE,
  WORKSPACE_SETTINGS_TAB_TYPE,
  WORKFLOW_TAB_TYPE,
} from './FlexLayout.config';
import { getTree } from '../Tree/Tree.helper';
import { WorkspaceImage } from '../Forms/CreateWorkspaceForm/WorkspaceImage';

const FLEX_LAYOUT_MODEL_ID = 'flexLayoutModel';

export const getLayoutModel = (): Model => {
  const savedModel = sessionStorage.getItem(FLEX_LAYOUT_MODEL_ID);
  const json = (
    savedModel ? JSON.parse(savedModel) : generateDefaultJson()
  ) as IJsonModel;
  return Model.fromJson(json);
};

const saveLayoutModel = (model: Model): void => {
  sessionStorage.setItem(FLEX_LAYOUT_MODEL_ID, JSON.stringify(model.toJson()));
};

export const resetLayout = (dispatch: AppDispatch, tabs?: TabInfo[]): void => {
  const newModel = Model.fromJson(generateDefaultJson());
  dispatch(setModel(newModel));
  if (tabs) {
    addNewTabsHandler(tabs, newModel, dispatch);
  }
  saveLayoutModel(newModel);
};

export interface TabInfo {
  tabNodeJson: IJsonTabNode;
  tabSetId: string;
  tabSetOrder: number;
}

export const addNewTabsHandler = (
  tabsInfo: TabInfo[],
  model: Model,
  dispatch: AppDispatch
): void => {
  let modelJson = model.toJson();
  for (const tabInfo of tabsInfo) {
    const { tabNodeJson, tabSetId, tabSetOrder } = tabInfo;
    if (tabNodeJson.id) {
      const openedTab = model.getNodeById(tabNodeJson.id) as TabNode;
      if (openedTab) {
        model.doAction(Actions.selectTab(tabNodeJson.id));
        continue;
      }
    }

    const tabsetNode = model.getNodeById(tabSetId) as TabSetNode;
    if (tabsetNode) {
      model.doAction(
        Actions.addNode(
          tabNodeJson,
          tabSetId,
          DockLocation.CENTER,
          tabsetNode.getChildren().length
        )
      );
      modelJson = model.toJson();
    } else {
      const newTabSetNode: IJsonTabSetNode = {
        ...tabSetMap[tabSetId],
        children: [tabNodeJson],
      };

      modelJson.layout.children.splice(tabSetOrder, 0, newTabSetNode);
      const newModel = Model.fromJson(modelJson);
      dispatch(setModel(newModel));
      saveLayoutModel(newModel);
    }
  }
};

const SELECT_TAB_ACTION = 'FlexLayout_SelectTab';
const DELETE_TAB_ACTION = 'FlexLayout_DeleteTab';

export const onModelChange =
  (dispatch: AppDispatch) =>
  (updatedModel: Model, action: Action): void => {
    if ([SELECT_TAB_ACTION, DELETE_TAB_ACTION].includes(action.type)) {
      const tabSetNode = updatedModel.getNodeById(
        PROMPT_EDITOR_TAB_SET_ID
      ) as TabSetNode;
      const tab = tabSetNode?.getSelectedNode() as TabNode;
      const config = tab?.getConfig();
      if (config?.type === PROMPT_CHAIN_TAB_TYPE) {
        dispatch(
          setSelectedEntity({
            selectedEntityId: config?.chainId as string | undefined,
            selectedEntityType: EntityType.promptChain,
          })
        );
      }
      if (config?.type === DATASET_TAB_TYPE) {
        dispatch(
          setSelectedEntity({
            selectedEntityId: config?.datasetId as string | undefined,
            selectedEntityType: EntityType.dataset,
          })
        );
      }
      if (config?.type === WORKFLOW_TAB_TYPE) {
        dispatch(
          setSelectedEntity({
            selectedEntityId: config?.workflowId as string | undefined,
            selectedEntityType: EntityType.workflow,
          })
        );
      }
    }

    saveLayoutModel(updatedModel);
  };

const getTabIcon = (value: string): ReactElement => {
  switch (value) {
    case TabIcons.outputIcon:
      return <OutputIcon />;
    case TabIcons.settingsIcon:
      return <SettingsIcon />;
    case TabIcons.datasetIcon:
      return <DatasetIcon />;
    case TabIcons.datasetCellIcon:
      return <DatasetCellIcon />;
    case TabIcons.workflowIcon:
      return <WorkflowIcon />;
    case TabIcons.connectorsIcon:
      return <ConnectorsIcon />;
    case TabIcons.chainIcon:
    default:
      return <FileTextIcon />;
  }
};

export const tabRender =
  (styles: Record<string, string>) =>
  (tab: TabNode, renderValues: ITabRenderValues): void => {
    const config = tab.getConfig();

    if (config?.icon) {
      renderValues.content = (
        <>
          {getTabIcon(config.icon as string)}
          <div className={styles.tabText}>{renderValues.content}</div>
        </>
      );
    }

    if (config?.type === WORKSPACE_SETTINGS_TAB_TYPE) {
      renderValues.content = (
        <div className={styles.tabWrapper}>
          {
            <WorkspaceImage
              name={tab.getName()}
              imagePreview={config.image}
              imageClass={styles.tabImage}
              imagePlaceholderClass={styles.tabImagePlaceholder}
              isDefault={tab.getId() === DEFAULT_DB}
            />
          }
          <div className={styles.tabText}>{renderValues.content}</div>
        </div>
      );
    }
  };

export const handleTabDrag = (
  dragging: TabNode | IJsonTabNode,
  over: TabNode,
  x: number,
  y: number
): any => {
  const isFirstColumn = over.getName() === LayoutComponentNames.library;

  if (isFirstColumn) {
    return {
      x,
      y,
      width: 0,
      height: 0,
      invalidated: () => {},
      cursor: 'not-allowed',
      callback: () => {},
    };
  }

  return undefined;
};

export const updateTabAttributes = (
  tabId: string,
  attributes: Record<string, any>,
  model: Model
): void => {
  const tabNode = model.getNodeById(tabId) as TabNode;

  if (!tabNode) {
    return;
  }

  const tabNodeJson = tabNode.toJson();

  const newAttributes = {
    ...tabNodeJson,
    ...attributes,
    config: {
      ...tabNodeJson.config,
      ...attributes.config,
    },
  };

  model.doAction(Actions.updateNodeAttributes(tabId, newAttributes));
};

export const createNewDataset = (
  db: IDBWrapper | null,
  model: Model,
  dispatch: AppDispatch
): void => {
  if (!db) return;
  createDataset(db)
    .then((dataset) => {
      addNewTabsHandler(
        [
          {
            tabNodeJson: {
              ...tabMap.datasetTab,
              id: dataset.DatasetID,
              config: {
                ...tabMap.datasetTab.config,
                datasetId: dataset.DatasetID,
              },
            },
            tabSetId: PROMPT_EDITOR_TAB_SET_ID,
            tabSetOrder: TabSetOrder.dataset,
          },
        ],
        model,
        dispatch
      );
      getTree(db, dispatch);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const createNewWorkflow = (
  db: IDBWrapper | null,
  model: Model,
  dispatch: AppDispatch
): void => {
  if (!db) return;
  createWorkflow(db)
    .then((workflowId) => {
      addNewTabsHandler(
        [
          {
            tabNodeJson: {
              ...tabMap.workflowTab,
              id: workflowId,
              config: {
                ...tabMap.workflowTab.config,
                workflowId,
              },
            },
            tabSetId: PROMPT_EDITOR_TAB_SET_ID,
            tabSetOrder: TabSetOrder.workflow,
          },
        ],
        model,
        dispatch
      );
      getTree(db, dispatch);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const createPromptChain = (
  db: IDBWrapper | null,
  model: Model,
  dispatch: AppDispatch
): void => {
  if (!db) return;
  createNewChain(db)
    .then((chainId: string) => {
      addNewTabsHandler(
        [
          {
            tabNodeJson: {
              ...tabMap.promptChainTab,
              id: chainId,
              config: { ...tabMap.promptChainTab.config, chainId },
            },
            tabSetId: PROMPT_EDITOR_TAB_SET_ID,
            tabSetOrder: TabSetOrder.promptChain,
          },
          {
            tabNodeJson: tabMap.outputTab,
            tabSetId: OUTPUTS_TAB_SET_ID,
            tabSetOrder: TabSetOrder.outputs,
          },
        ],
        model,
        dispatch
      );
      getTree(db, dispatch);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const removeTabById = (tabId: string, model: Model): void => {
  const targetTab = model.getNodeById(tabId) as TabNode;
  if (!targetTab) {
    return;
  }
  model.doAction(Actions.deleteTab(tabId));
};

export const removeTabsetById = (tabsetId: string, model: Model): void => {
  const targetTabset = model.getNodeById(tabsetId) as TabNode;
  if (!targetTabset) {
    return;
  }
  model.doAction(Actions.deleteTabset(tabsetId));
};
