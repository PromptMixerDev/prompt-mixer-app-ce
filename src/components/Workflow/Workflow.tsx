import React, { useContext, useEffect } from 'react';
import { WorkspaceDatabaseContext } from 'contexts';
import {
  useAppDispatch,
  useAppSelector,
  useIpcRenderer,
  usePrevious,
} from 'hooks';
import { DICTIONARY } from 'dictionary';
import { updateVariable, type Variable } from 'db/workspaceDb';
import { ReactComponent as PlayIcon } from 'assets/icons/play.svg';
import { ReactComponent as CurlyBracketsIcon } from 'assets/icons/curly-brackets.svg';
import { selectWorkflowById } from 'store/workflow/workflowSelectors';
import { selectWorkflowVariables } from 'store/variables/variablesSelectors';
import { selectWorkflowModels } from 'store/model/modelSelectors';
import { selectWorkflowPromptItems } from 'store/prompts/promptsSelectors';
import {
  EntityType,
  setSelectedEntity,
} from 'store/selectedEntity/selectedEntitySlice';
import { InputProperty } from '../ModelsSelector/ModelProperties/InputProperty';
import {
  openOutputTab,
  readAndSetChainModels,
  readAndSetPrompts,
  readAndSetVariables,
} from '../PromptEditor/PromptEditor.helper';
import { WorkflowTitle } from './WorkflowTitle';
import { AccordionSection } from '../AccordionSection';
import { Button, ButtonColor, ButtonSize, ButtonTypes } from '../Button';
import { WorkflowArea } from './WorkflowArea';
import {
  handleAddedChainVariables,
  processRemovedChainVariables,
  readAndSetWorkflow,
  isRunButtonDisabled,
  processVariables,
  handleRunWorkflow,
} from './Workflow.helper';
import styles from './Workflow.module.css';

interface WorkflowProps {
  workflowId: string;
}

const filterDuplicates = (variables: Variable[]): Variable[] => {
  const uniqueNames = new Set<string>();
  return variables.filter((variable) => {
    if (uniqueNames.has(variable.Name)) {
      return false;
    } else {
      uniqueNames.add(variable.Name);
      return true;
    }
  });
};

export const Workflow: React.FC<WorkflowProps> = ({ workflowId }) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { model: flexLayoutModel } = useAppSelector(
    (store) => store.flexLayoutModel
  );
  const workflow = useAppSelector(selectWorkflowById(workflowId));
  const chainIds = workflow?.Chains?.map((chain) => chain.ChainID) ?? [];
  const prevChainIds = usePrevious(chainIds);
  const variables = useAppSelector(
    selectWorkflowVariables(chainIds, workflowId)
  );
  const models = useAppSelector(selectWorkflowModels(chainIds));
  const promptItems = useAppSelector(selectWorkflowPromptItems(chainIds));
  const { runningModels } = useAppSelector((state) => state.model);
  const filteredVariables = filterDuplicates(variables);
  const isDisabled = isRunButtonDisabled(
    workflowId,
    models,
    promptItems,
    runningModels
  );
  const { send } = useIpcRenderer();

  useEffect(() => {
    readAndSetWorkflow(db, workflowId, dispatch);
    dispatch(
      setSelectedEntity({
        selectedEntityId: workflowId,
        selectedEntityType: EntityType.workflow,
      })
    );
  }, []);

  useEffect(() => {
    chainIds.forEach((chainId) => {
      readAndSetVariables(db, chainId, dispatch);
      readAndSetChainModels(db, chainId, dispatch);
      readAndSetPrompts(db, chainId, dispatch);
    });
  }, [workflow]);

  useEffect(() => {
    processVariables(db, workflowId, variables, dispatch);
  }, [variables]);

  useEffect(() => {
    (async () => {
      if (prevChainIds && prevChainIds.length < chainIds.length) {
        const addedChainIds = chainIds.filter(
          (chainId) => !prevChainIds?.find((el) => el === chainId)
        );
        await Promise.all(
          addedChainIds.map(async (chainId) => {
            await handleAddedChainVariables(
              db,
              workflowId,
              chainId,
              variables,
              dispatch
            );
          })
        );
      }
    })();
  }, [chainIds]);

  const changeVariable =
    (workflowVariable: Variable) =>
    (index: number, value: string): void => {
      const variablesToUpdate = variables.filter(
        (variable) => variable.Name === workflowVariable.Name
      );
      variablesToUpdate.forEach((variable) => {
        updateVariable(db, variable.VariableID, {
          WorkflowValues: { ...variable.WorkflowValues, [workflowId]: value },
        })
          .then(() => {
            readAndSetVariables(db, variable.ChainID, dispatch);
          })
          .catch((error) => console.error(error));
      });
    };

  const handleRemovedChainVariables = (chainId: string): void => {
    processRemovedChainVariables(db, workflowId, chainId, variables, dispatch);
  };

  const runWorkflow = async (): Promise<void> => {
    const chain = workflow!.Chains[0];
    const chainId = chain.ChainID;
    await handleRunWorkflow({
      db,
      workflowId,
      chain,
      promptItems: promptItems[chainId],
      model: models[chainId]!,
      dispatch,
      send,
      variables,
      workflow: workflow!,
    });
    openOutputTab(flexLayoutModel, dispatch);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Button
          type={ButtonTypes.iconText}
          color={ButtonColor.success}
          size={ButtonSize.m}
          splitted={true}
          onClick={runWorkflow}
          disabled={isDisabled}
          buttonClass={isDisabled ? styles.disabledRunButton : styles.runButton}
        >
          <PlayIcon />
          <span>{DICTIONARY.labels.workflow}</span>
        </Button>
      </div>
      <div className={styles.content}>
        <WorkflowTitle workflowId={workflowId} />
        {!!filteredVariables?.length && (
          <AccordionSection title={DICTIONARY.labels.variables}>
            <div className={styles.variables}>
              {filteredVariables.map((variable, ind) => (
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
          title={DICTIONARY.labels.workflow}
          showArrowButton={false}
        >
          {workflow && (
            <WorkflowArea
              workflow={workflow}
              handleRemovedChainVariables={handleRemovedChainVariables}
            />
          )}
        </AccordionSection>
      </div>
    </div>
  );
};
