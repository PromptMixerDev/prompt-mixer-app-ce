import React, { useContext } from 'react';
import { DICTIONARY } from 'dictionary';
import { useAppDispatch, useAppSelector } from 'hooks';
import { WorkspaceDatabaseContext } from 'contexts';
import { type AITool } from 'db/workspaceDb';
import { ReactComponent as FormulaIcon } from 'assets/icons/formula.svg';
import { ReactComponent as AddIcon } from 'assets/icons/add.svg';
import { selectAIToolsByChainId } from 'store/aiTools/aiToolsSelectors';
import { AccordionSection } from '../AccordionSection';
import { Button, ButtonTypes } from '../Button';
import { InputProperty } from '../ModelsSelector/ModelProperties/InputProperty';
import { handleAIToolAdd, handleAIToolUpdate } from './AITools.helper';
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

  return (
    <AccordionSection title={DICTIONARY.labels.tools}>
      <div className={styles.aiTools}>
        {aiTools.map((aiTool, ind) => (
          <InputProperty
            key={aiTool.AIToolID}
            index={ind}
            property={aiTool}
            onChange={(_ind, newValue) => onAIToolUpdate(newValue, aiTool)}
            wrapperClass={styles.aiToolWrapper}
            icon={FormulaIcon}
          />
        ))}
        <Button
          type={ButtonTypes.iconText}
          buttonClass={styles.addNewButton}
          buttonWrapperClass={styles.addNewButtonWrapper}
          onClick={onAIToolAdd}
        >
          <AddIcon />
          <span>{DICTIONARY.labels.addNew}</span>
        </Button>
      </div>
    </AccordionSection>
  );
};
