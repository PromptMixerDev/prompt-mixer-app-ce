import React, {
  useState,
  type FunctionComponent,
  type SVGAttributes,
  useRef,
  useEffect,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ReactComponent as FileTextIcon } from 'assets/icons/file-text.svg';
import { ReactComponent as PlayFillIcon } from 'assets/icons/play-fll.svg';
import { ReactComponent as SettingsIcon } from 'assets/icons/settings.svg';
import { ReactComponent as PazzleIcon } from 'assets/icons/pazzle.svg';
import { ReactComponent as DatasetIcon } from 'assets/icons/dataset-purple.svg';
import { DICTIONARY } from 'dictionary';
import {
  useAppDispatch,
  useAppSelector,
  useResizeObserver,
  useWindowResize,
} from 'hooks';
import { ToolCard } from './ToolCard';
import { ToolButton } from './ToolButton';
import {
  tabMap,
  SETTINGS_TAB_SET_ID,
  OUTPUTS_TAB_SET_ID,
  PROMPT_EDITOR_TAB_SET_ID,
  TabSetOrder,
  TOOLS_WEIGHT_EXPANDED,
  TOOLS_WEIGHT_COLLAPSED,
  TOOLS,
  CONNECTORS_TAB_SET_ID,
} from '../FlexLayout/FlexLayout.config';
import {
  addNewTabsHandler,
  updateTabAttributes,
} from '../FlexLayout/FlexLayout.helper';
import styles from './Tools.module.css';

interface Tool {
  icon: FunctionComponent<SVGAttributes<SVGElement>>;
  name: string;
  className: string;
  onClick: () => void;
}

export const Tools: React.FC = () => {
  const dispatch = useAppDispatch();
  const { model } = useAppSelector((state) => state.flexLayoutModel);
  const [collapsed, setCollapsed] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const toolRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const toolsNode = model.getNodeById(TOOLS) as any;
    const currentWeight = toolsNode?.getWeight?.();

    if (typeof currentWeight === 'number') {
      setCollapsed(currentWeight <= TOOLS_WEIGHT_COLLAPSED + 0.5);
    }
  }, [model]);

  const updateButtonPosition = (): void => {
    if (toolRef.current) {
      const { top, right } = toolRef.current.getBoundingClientRect();
      setButtonPosition({ top: top - 30, left: right - 36 });
    }
  };
  useResizeObserver(toolRef, updateButtonPosition);
  useWindowResize(updateButtonPosition);

  const handleClick = (): void => {
    const weight = collapsed ? TOOLS_WEIGHT_EXPANDED : TOOLS_WEIGHT_COLLAPSED;
    updateTabAttributes(TOOLS, { weight }, model);
    setCollapsed(!collapsed);
  };

  const tools: Tool[] = [
    {
      icon: FileTextIcon,
      name: DICTIONARY.labels.prompt,
      className: 'prompt',
      onClick: () => {
        addNewTabsHandler(
          [
            {
              tabNodeJson: { ...tabMap.promptChainTab, id: uuidv4() },
              tabSetId: PROMPT_EDITOR_TAB_SET_ID,
              tabSetOrder: TabSetOrder.promptChain,
            },
          ],
          model,
          dispatch
        );
      },
    },
    {
      icon: PlayFillIcon,
      name: DICTIONARY.labels.output,
      className: 'output',
      onClick: () => {
        addNewTabsHandler(
          [
            {
              tabNodeJson: tabMap.outputTab,
              tabSetId: OUTPUTS_TAB_SET_ID,
              tabSetOrder: TabSetOrder.outputs,
            },
          ],
          model,
          dispatch
        );
      },
    },
    {
      icon: PazzleIcon,
      name: DICTIONARY.labels.connectors,
      className: 'connectors',
      onClick: () => {
        addNewTabsHandler(
          [
            {
              tabNodeJson: tabMap.connectorsTab,
              tabSetId: CONNECTORS_TAB_SET_ID,
              tabSetOrder: TabSetOrder.connectors,
            },
          ],
          model,
          dispatch
        );
      },
    },
    {
      icon: DatasetIcon,
      name: DICTIONARY.labels.dataset,
      className: 'dataset',
      onClick: () => {
        addNewTabsHandler(
          [
            {
              tabNodeJson: { ...tabMap.datasetTab, id: uuidv4() },
              tabSetId: PROMPT_EDITOR_TAB_SET_ID,
              tabSetOrder: TabSetOrder.dataset,
            },
          ],
          model,
          dispatch
        );
      },
    },
    {
      icon: SettingsIcon,
      name: DICTIONARY.labels.settings,
      className: 'settings',
      onClick: () => {
        addNewTabsHandler(
          [
            {
              tabNodeJson: tabMap.settingsTab,
              tabSetId: SETTINGS_TAB_SET_ID,
              tabSetOrder: TabSetOrder.settings,
            },
          ],
          model,
          dispatch
        );
      },
    },
  ];

  return (
    <>
      <div className={styles.wrapper} ref={toolRef}>
        {tools.map((tool, index) => (
          <ToolCard
            key={index}
            icon={tool.icon}
            label={tool.name}
            onClick={tool.onClick}
            className={tool.className}
          />
        ))}
      </div>
      <ToolButton
        onClick={handleClick}
        buttonPosition={buttonPosition}
        collapsed={collapsed}
      />
    </>
  );
};
