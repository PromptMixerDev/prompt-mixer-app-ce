/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import {
  type IJsonTabNode,
  type IJsonModel,
  type IJsonTabSetNode,
} from 'flexlayout-react';
import { v4 as uuidv4 } from 'uuid';

const ROW_ID = 'row';
export const SIDE_BAR = 'side_bar';
export const LIBRARY_TABSET_ID = 'library';
export const TOOLS = 'tools';
export const PROMPT_EDITOR_TAB_SET_ID = 'promptEditorTabset';
export const OUTPUTS_TAB_SET_ID = 'outputsTabset';
export const SETTINGS_TAB_SET_ID = 'settingsTabset';
export const CONNECTORS_TAB_SET_ID = 'connectorsTabset';
export const DATASET_CELL_TAB_SET_ID = 'datasetCellTabset';
const SETTINGS_TAB_ID = 'settingsTab';
const OUTPUT_TAB_ID = 'outputTab';
const CONNECTORS_TAB_ID = 'connectorsTab';
export const DATASET_CELL_TAB_ID = 'datasetCellTab';
export const PROMPT_CHAIN_TAB_TYPE = 'promptChainTab';
export const WORKSPACE_SETTINGS_TAB_TYPE = 'workspaceSettingsTab';
export const DATASET_TAB_TYPE = 'datasetTab';
export const WORKFLOW_TAB_TYPE = 'workflowTab';
export const MIN_WIDTH = 280;
export const SPLITTER_SIZE = 6;
export const LIBRARY_TABSET_WEIGHT = 100;
export const TOOLS_WEIGHT_EXPANDED = 24;
export const TOOLS_WEIGHT_COLLAPSED = 2;
export const SIDE_BAR_WEIGHT = 18;

export enum TabIcons {
  chainIcon = 'chainIcon',
  settingsIcon = 'settingsIcon',
  outputIcon = 'outputIcon',
  connectorsIcon = 'connectorsIcon',
  datasetIcon = 'datasetIcon',
  datasetCellIcon = 'datasetCellIcon',
  workflowIcon = 'workflowIcon',
}

enum LayoutTypes {
  tab = 'tab',
  row = 'row',
  tabset = 'tabset',
  border = 'border',
}

export enum LayoutComponents {
  tree = 'Tree',
  output = 'Output',
  promptEditor = 'PromptEditor',
  tools = 'Tools',
  settings = 'Settings',
  connectors = 'Connectors',
  dataset = 'Dataset',
  datasetCellInfo = 'DatasetCellInfo',
  workspaceSettings = 'WorkspaceSettings',
  workflow = 'Workflow',
}

export enum LayoutComponentNames {
  library = 'Library',
  outputs = 'Outputs',
  promptChain = 'Untitled',
  tools = 'Tools',
  settings = 'Settings',
  connectors = 'Connectors',
  dataset = 'Untitled',
  workflow = 'Workflow',
}

export enum TabSetOrder {
  library = 0,
  settings = 1,
  connectors = 2,
  promptChain = 3,
  dataset = 3,
  workflow = 3,
  datasetCell = 4,
  outputs = 5,
}

export const tabSetMap: Record<string, IJsonTabSetNode> = {
  promptEditorTabset: {
    type: LayoutTypes.tabset,
    id: PROMPT_EDITOR_TAB_SET_ID,
    minWidth: MIN_WIDTH,
    weight: 40,
    children: [],
  },
  settingsTabset: {
    id: SETTINGS_TAB_SET_ID,
    type: LayoutTypes.tabset,
    minWidth: MIN_WIDTH,
    weight: 40,
    children: [],
  },
  outputsTabset: {
    id: OUTPUTS_TAB_SET_ID,
    type: LayoutTypes.tabset,
    minWidth: MIN_WIDTH,
    weight: 40,
    children: [],
  },
  connectorsTabset: {
    id: CONNECTORS_TAB_SET_ID,
    type: LayoutTypes.tabset,
    minWidth: MIN_WIDTH,
    weight: 40,
    children: [],
  },
  datasetCellTabset: {
    id: DATASET_CELL_TAB_SET_ID,
    type: LayoutTypes.tabset,
    minWidth: MIN_WIDTH,
    weight: 40,
    children: [],
  },
};

export const tabMap: Record<string, IJsonTabNode> = {
  promptChainTab: {
    type: LayoutTypes.tab,
    enableRename: false,
    name: LayoutComponentNames.promptChain,
    component: LayoutComponents.promptEditor,
    config: {
      type: PROMPT_CHAIN_TAB_TYPE,
      icon: TabIcons.chainIcon,
    },
  },
  settingsTab: {
    id: SETTINGS_TAB_ID,
    type: LayoutTypes.tab,
    enableRename: false,
    name: LayoutComponentNames.settings,
    component: LayoutComponents.settings,
    config: {
      icon: TabIcons.settingsIcon,
    },
  },
  outputTab: {
    id: OUTPUT_TAB_ID,
    type: LayoutTypes.tab,
    enableRename: false,
    name: LayoutComponentNames.outputs,
    component: LayoutComponents.output,
    config: {
      icon: TabIcons.outputIcon,
    },
  },
  connectorsTab: {
    id: CONNECTORS_TAB_ID,
    type: LayoutTypes.tab,
    enableRename: false,
    name: LayoutComponentNames.connectors,
    component: LayoutComponents.connectors,
    config: {
      icon: TabIcons.connectorsIcon,
    },
  },
  datasetTab: {
    type: LayoutTypes.tab,
    enableRename: false,
    name: LayoutComponentNames.dataset,
    component: LayoutComponents.dataset,
    config: {
      type: DATASET_TAB_TYPE,
      icon: TabIcons.datasetIcon,
    },
  },
  datasetCellTab: {
    id: DATASET_CELL_TAB_ID,
    type: LayoutTypes.tab,
    enableRename: false,
    component: LayoutComponents.datasetCellInfo,
    config: {
      icon: TabIcons.datasetCellIcon,
    },
  },
  workspaceSettingsTab: {
    type: LayoutTypes.tab,
    enableRename: false,
    component: LayoutComponents.workspaceSettings,
    config: {
      type: WORKSPACE_SETTINGS_TAB_TYPE,
    },
  },
  workflowTab: {
    type: LayoutTypes.tab,
    enableRename: false,
    name: LayoutComponentNames.workflow,
    component: LayoutComponents.workflow,
    config: {
      type: WORKFLOW_TAB_TYPE,
      icon: TabIcons.workflowIcon,
    },
  },
};

export const generateDefaultJson: () => IJsonModel = () => ({
  global: {
    tabSetEnableMaximize: false,
    splitterSize: 6,
    tabSetEnableDrag: false,
    enableEdgeDock: false,
  },
  borders: [],
  layout: {
    id: ROW_ID,
    type: LayoutTypes.row,
    weight: 100,
    children: [
      {
        id: SIDE_BAR,
        type: LayoutTypes.row,
        weight: SIDE_BAR_WEIGHT,
        children: [
          {
            id: LIBRARY_TABSET_ID,
            type: LayoutTypes.tabset,
            enableSingleTabStretch: true,
            enableDrag: false,
            enableDrop: false,
            minWidth: MIN_WIDTH,
            weight: LIBRARY_TABSET_WEIGHT,
            children: [
              {
                type: LayoutTypes.tab,
                name: LayoutComponentNames.library,
                component: LayoutComponents.tree,
                enableRename: false,
                enableClose: false,
                enableDrag: false,
              },
            ],
          },
          {
            id: TOOLS,
            type: LayoutTypes.tabset,
            weight: TOOLS_WEIGHT_EXPANDED,
            enableSingleTabStretch: true,
            enableDrag: false,
            enableDrop: false,
            children: [
              {
                type: LayoutTypes.tab,
                name: LayoutComponentNames.tools,
                component: LayoutComponents.tools,
                enableRename: false,
                enableClose: false,
                enableDrag: false,
              },
            ],
          },
        ],
      },
      {
        type: LayoutTypes.tabset,
        id: PROMPT_EDITOR_TAB_SET_ID,
        weight: 40,
        minWidth: MIN_WIDTH,
        children: [{ ...tabMap.promptChainTab, id: uuidv4() }],
      },
      {
        type: LayoutTypes.tabset,
        minWidth: MIN_WIDTH,
        weight: 40,
        children: [tabMap.outputTab],
      },
    ],
  },
});
