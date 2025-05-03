import React, { useContext } from 'react';
import { DICTIONARY } from 'dictionary';
import { useAppDispatch, useAppSelector } from 'hooks';
import { WorkspaceDatabaseContext } from 'contexts';
import { type AITool } from 'db/workspaceDb';
import { ReactComponent as FormulaIcon } from 'assets/icons/formula.svg';
import { ReactComponent as AddIcon } from 'assets/icons/add.svg';
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg';
import { selectAIToolsByChainId } from 'store/aiTools/aiToolsSelectors';
import { AccordionSection } from '../AccordionSection';
import { Button, ButtonTypes } from '../Button';
import { InputProperty } from '../ModelsSelector/ModelProperties/InputProperty';
import {
  handleAIToolAdd,
  handleAIToolDelete,
  handleAIToolUpdate,
  validateJSON,
} from './AITools.helper';
import styles from './AITools.module.css';

export interface IAITool extends Omit<AITool, 'CreatedAt'> {
  CreatedAt?: Date;
}

interface AIToolsProps {
  chainId?: string;
  tabId: string;
}

export const AITools: React.FC<AIToolsProps> = ({ chainId, tabId }) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const aiTools = useAppSelector(selectAIToolsByChainId(chainId ?? tabId));
  const dispatch = useAppDispatch();

  const onAIToolAdd = (): void => {
    handleAIToolAdd(db, aiTools, dispatch, tabId, chainId);
  };

  const onAIToolUpdate = (newValue: string, aiTool: IAITool): void => {
    handleAIToolUpdate(db, newValue, aiTool, dispatch, tabId, chainId);
  };

  const onAIToolDelete = (aiTool: IAITool): void => {
    handleAIToolDelete(db, aiTool, dispatch, tabId, chainId);
  };

  return (
    <AccordionSection title={DICTIONARY.labels.mcp}>
      <div className={styles.aiTools}>
        {aiTools.map((aiTool, ind) => (
          <div className={styles.aiToolWrapper} key={aiTool.AIToolID}>
            <InputProperty
              index={ind}
              property={{ ...aiTool, Name: DICTIONARY.labels.mcpConfig }}
              onChange={(_ind, newValue) => onAIToolUpdate(newValue, aiTool)}
              wrapperClass={styles.aiTool}
              icon={FormulaIcon}
              validate={validateJSON}
              placeholder={DICTIONARY.placeholders.mcpConfig}
            />
            <Button
              type={ButtonTypes.icon}
              onClick={() => onAIToolDelete(aiTool)}
              buttonWrapperClass={styles.deleteButtonWrapper}
            >
              <DeleteIcon />
            </Button>
          </div>
        ))}
        {aiTools.length === 0 && (
          <Button
            type={ButtonTypes.iconText}
            buttonClass={styles.addNewButton}
            buttonWrapperClass={styles.addNewButtonWrapper}
            onClick={onAIToolAdd}
          >
            <AddIcon />
            <span>{DICTIONARY.labels.add}</span>
          </Button>
        )}
      </div>
    </AccordionSection>
  );
};
