/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useEffect, useContext } from 'react';
import { DICTIONARY } from 'dictionary';
import { ReactComponent as PlayIcon } from 'assets/icons/play.svg';
import { ReactComponent as CurlyBracketsIcon } from 'assets/icons/curly-brackets.svg';
import {
  type Variable,
  updateVariable,
  type Prompt,
  type PromptVersion,
} from 'db/workspaceDb';
import { useAppDispatch, useAppSelector, useIpcRenderer } from 'hooks';
import { WorkspaceDatabaseContext } from 'contexts';
import {
  EntityType,
  setSelectedEntity,
} from 'store/selectedEntity/selectedEntitySlice';
import { selectModelsByChainId } from 'store/model/modelSelectors';
import { setModelsByChainId } from 'store/model/modelSlice';
import { selectPromptItemsByChainId } from 'store/prompts/promptsSelectors';
import { addPromptItems } from 'store/prompts/promptsSlice';
import { selectVariablesByChainId } from 'store/variables/variablesSelectors';
import { updateVariables } from 'store/variables/variablesSlice';
import {
  createAndSetChain,
  getDefaultModel,
  getDefaultPrompt,
  handleRunModel,
  isRunButtonDisabled,
  readAndSetChainModels,
  readAndSetPrompts,
  readAndSetVariables,
} from './PromptEditor.helper';
import { Button, ButtonColor, ButtonSize, ButtonTypes } from '../Button';
import { ModelsSelector } from '../ModelsSelector';
import { AccordionSection } from '../AccordionSection';
import { EditorArea } from './EditorArea';
import { ChainTitle } from './ChainTitle';
import { InputProperty } from '../ModelsSelector/ModelProperties/InputProperty';
import styles from './PromptEditor.module.css';

export type IPromptItem = Omit<Prompt & PromptVersion, 'CreatedAt'>;

export interface DefaultPromptItem
  extends Omit<IPromptItem, 'ChainID' | 'CreatedAt'> {
  ChainID?: string;
  Default: boolean;
}

interface PromptEditorProps {
  tabId: string;
  chainId?: string;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  tabId,
  chainId,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { selectedEntityId } = useAppSelector((state) => state.selectedEntity);
  const { model: flexLayoutModel } = useAppSelector(
    (state) => state.flexLayoutModel
  );
  const models = useAppSelector(selectModelsByChainId(chainId ?? tabId));
  const variables = useAppSelector(selectVariablesByChainId(chainId ?? tabId));
  const { runningModels } = useAppSelector((state) => state.model);
  const promptItems = useAppSelector(
    selectPromptItemsByChainId(chainId ?? tabId)
  );
  const isDisabled = isRunButtonDisabled(
    chainId,
    models,
    promptItems,
    runningModels
  );

  const { send } = useIpcRenderer();

  useEffect(() => {
    if (chainId) {
      readAndSetChainModels(db, chainId, dispatch);
      readAndSetPrompts(db, chainId, dispatch);
      readAndSetVariables(db, chainId, dispatch);
      dispatch(
        setSelectedEntity({
          selectedEntityId: chainId,
          selectedEntityType: EntityType.promptChain,
        })
      );
    } else {
      dispatch(
        setModelsByChainId({ chainId: tabId, models: [getDefaultModel(tabId)] })
      );
      dispatch(
        addPromptItems({
          chainId: chainId ?? tabId,
          promptItems: [getDefaultPrompt()],
        })
      );
      dispatch(
        setSelectedEntity({
          selectedEntityId: undefined,
          selectedEntityType: EntityType.promptChain,
        })
      );
    }
  }, []);

  const handleCreateChainModel = async (): Promise<string> => {
    await createAndSetChain(db, tabId, models, flexLayoutModel, dispatch);
    return tabId;
  };

  const runModel = async (): Promise<void> => {
    await handleRunModel({
      db,
      promptItems,
      chainId,
      models,
      dispatch,
      send,
      variables,
      flexLayoutModel,
    });
  };

  const changeVariable =
    (variable: Variable) =>
    (index: number, value: string): void => {
      updateVariable(db, variable.VariableID, { Value: value })
        .then(() => {
          const updatedVariables = variables.map((el) => {
            if (el.VariableID === variable.VariableID) {
              return {
                ...variable,
                Value: value,
              };
            }
            return el;
          });
          dispatch(
            updateVariables({ chainId: chainId!, variables: updatedVariables })
          );
        })
        .catch((error) => console.error(error));
    };

  return (
    <div>
      <div className={styles.header}>
        <Button
          id="run-button"
          type={ButtonTypes.iconText}
          color={ButtonColor.success}
          size={ButtonSize.m}
          splitted={true}
          onClick={runModel}
          disabled={isDisabled}
          buttonClass={isDisabled ? styles.disabledRunButton : styles.runButton}
        >
          <PlayIcon />
          <span>{DICTIONARY.labels.run}</span>
        </Button>
      </div>
      <div className={styles.content}>
        <ChainTitle tabId={tabId} chainId={chainId} models={models} />
        <ModelsSelector tabId={tabId} models={models} chainId={chainId} />
        {!!variables?.length && (
          <AccordionSection title={DICTIONARY.labels.variables}>
            <div className={styles.variables}>
              {variables.map((variable, ind) => (
                <InputProperty
                  key={variable.VariableID}
                  index={ind}
                  property={variable}
                  onChange={changeVariable(variable)}
                  wrapperClass={styles.variableWrapper}
                  icon={CurlyBracketsIcon}
                />
              ))}
            </div>
          </AccordionSection>
        )}
        <AccordionSection
          title={DICTIONARY.labels.chain}
          showArrowButton={false}
        >
          {!!promptItems.length && (
            <EditorArea
              promptItems={promptItems}
              handleCreateChainModel={handleCreateChainModel}
              tabId={tabId}
              selectedEntityId={selectedEntityId}
              variables={variables}
            />
          )}
        </AccordionSection>
      </div>
    </div>
  );
};
