/* eslint-disable @typescript-eslint/no-unsafe-argument */
import classnames from 'classnames';
import React, { useContext, useRef } from 'react';
import { WorkspaceDatabaseContext } from 'contexts';
import { useAppDispatch } from 'hooks';
import { type IWorkflow } from 'store/workflow/workflowSlice';
import {
  removeWorkflowChain,
  useTopBlockDrop,
  useWorkflowAreaDrop,
} from './WorkflowArea.helper';
import { WorkflowChain } from '../WorkflowChain';
import styles from './WorkflowArea.module.css';

interface WorkflowAreaProps {
  handleRemovedChainVariables: (value: string) => void;
  workflow: IWorkflow;
}

export const WorkflowArea: React.FC<WorkflowAreaProps> = ({
  workflow,
  handleRemovedChainVariables,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const topBlockRef = useRef<HTMLDivElement | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const [, drop] = useWorkflowAreaDrop(db, workflow, dispatch);
  const [{ isOver }, topBlockDrop] = useTopBlockDrop(db, workflow, dispatch);

  const handleRemoveChain = (chainId: string): void => {
    removeWorkflowChain(db, chainId, workflow, dispatch);
    handleRemovedChainVariables(chainId);
  };

  drop(ref);
  topBlockDrop(topBlockRef);
  return (
    <div ref={ref} className={styles.wrapper}>
      <div
        ref={topBlockRef}
        className={classnames(styles.topBlock, isOver && styles.over)}
      ></div>
      {workflow.Chains.map((chain, ind) => (
        <WorkflowChain
          key={chain.ChainID}
          index={ind}
          chain={chain}
          workflow={workflow}
          removeChain={handleRemoveChain}
        />
      ))}
    </div>
  );
};
