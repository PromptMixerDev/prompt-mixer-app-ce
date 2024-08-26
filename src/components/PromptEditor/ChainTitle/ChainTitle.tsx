import React, { useContext } from 'react';
import {
  updatePromptChain,
  type Prompt,
  type PromptVersion,
  createNewChain,
} from 'db/workspaceDb';
import { useAppDispatch, useAppSelector } from 'hooks';
import { DICTIONARY } from 'dictionary';
import { WorkspaceDatabaseContext } from 'contexts';
import {
  EntityType,
  setSelectedEntity,
} from 'store/selectedEntity/selectedEntitySlice';
import { updateTreeItem } from 'store/tree/treeSlice';
import { type ModelType } from 'store/model/modelSlice';
import { createModels } from '../PromptEditor.helper';
import { getTree } from '../../Tree/Tree.helper';
import { Title } from '../../Title';
import { updateTabAttributes } from '../../FlexLayout/FlexLayout.helper';

export type IPromptItem = Prompt & PromptVersion;

export interface DefaultPromptItem extends Omit<IPromptItem, 'ChainID'> {
  ChainID?: string;
  Default: boolean;
}

interface ChainTitleProps {
  tabId: string;
  chainId?: string;
  models: ModelType[];
}

export const ChainTitle: React.FC<ChainTitleProps> = ({
  tabId,
  chainId,
  models,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { selectedEntityId } = useAppSelector((state) => state.selectedEntity);
  const { model: flexLayoutModel } = useAppSelector(
    (state) => state.flexLayoutModel
  );

  const handleTitleBlur = (title: string): void => {
    const newTitle = title || DICTIONARY.labels.untitled;
    if (selectedEntityId) {
      updatePromptChain(db, selectedEntityId, { Title: newTitle })
        .then(() => {
          updateTabAttributes(
            selectedEntityId,
            { name: newTitle },
            flexLayoutModel
          );
          dispatch(updateTreeItem({ id: selectedEntityId, label: newTitle }));
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      dispatch(
        setSelectedEntity({
          selectedEntityId: tabId,
          selectedEntityType: EntityType.promptChain,
        })
      );
      createNewChain(db, { ChainID: tabId, Title: newTitle })
        .then((chainId) => {
          createModels(db, models, chainId);
          updateTabAttributes(
            chainId,
            {
              name: newTitle,
              config: { chainId },
            },
            flexLayoutModel
          );
          getTree(db, dispatch);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };

  return <Title entityId={chainId} handleTitleBlur={handleTitleBlur} />;
};
