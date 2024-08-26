/* eslint-disable @typescript-eslint/no-unsafe-argument */
import classnames from 'classnames';
import React, { useContext, useRef } from 'react';
import { WorkspaceDatabaseContext } from 'contexts';
import { useAppDispatch } from 'hooks';
import { type PromptChain } from 'db/workspaceDb';
import { type IWorkflow } from 'store/workflow/workflowSlice';
import { ReactComponent as FileTextIcon } from 'assets/icons/file-text.svg';
import { ReactComponent as CloseIcon } from 'assets/icons/close.svg';
import { Button, ButtonTypes } from 'components/Button';
import {
  useWorkflowChainDrag,
  useWorkflowChainDrop,
} from './WorkflowChain.helper';
import styles from './WorkflowChain.module.css';

interface WorkflowChainProps {
  workflow: IWorkflow;
  chain: PromptChain;
  removeChain: (chainId: string) => void;
  index: number;
}

export const WorkflowChain: React.FC<WorkflowChainProps> = ({
  workflow,
  chain,
  removeChain,
  index,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const ref = useRef(null);
  const dispatch = useAppDispatch();
  const [{ isDragging }, drag] = useWorkflowChainDrag(chain);
  const [{ isOver }, drop] = useWorkflowChainDrop(
    db,
    workflow,
    index + 1,
    dispatch
  );
  drag(drop(ref));

  return (
    <div
      className={classnames(styles.wrapper, isOver && styles.over)}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      ref={ref}
    >
      <div className={styles.borderedWrapper}>
        <FileTextIcon className={styles.fileIcon} />
        {chain.Title}
        <Button
          type={ButtonTypes.icon}
          onClick={() => removeChain(chain.ChainID)}
          buttonWrapperClass={styles.close}
        >
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
};
