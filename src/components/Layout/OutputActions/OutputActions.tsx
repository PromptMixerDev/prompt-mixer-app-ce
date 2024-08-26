import React, { useContext } from 'react';
import { updateOutput, updateWorkflowOutput } from 'db/workspaceDb';
import { useAppDispatch } from 'hooks';
import { WorkspaceDatabaseContext } from 'contexts';
import {
  type OutputType,
  updateOutput as updateReduxOutput,
} from 'store/outputs/outputsSlice';
import {
  type WorkflowOutputType,
  updateWorkflowOutput as updateReduxWorkflowOutput,
} from 'store/workflowOutputs/workflowOutputsSlice';
import { ReactComponent as CopyIcon } from 'assets/icons/copy.svg';
import { ReactComponent as DeleteIcon } from 'assets/icons/delete.svg';
import { ReactComponent as LikeIcon } from 'assets/icons/like.svg';
import { ReactComponent as DislikeIcon } from 'assets/icons/dislike.svg';
import { Button, ButtonTypes } from '../../Button';
import styles from './OutputActions.module.css';

interface OutputActionsProps {
  output: OutputType | WorkflowOutputType;
  handleDeleteOutput: (id: string) => void;
  copyTextToClipboard: () => Promise<void>;
  isChain: boolean;
}

enum RateButtons {
  like,
  dislike,
}

export const OutputActions: React.FC<OutputActionsProps> = ({
  output,
  handleDeleteOutput,
  copyTextToClipboard,
  isChain,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const updateOutputFn = isChain ? updateOutput : updateWorkflowOutput;

  const handleOutputRating = (button: RateButtons): void => {
    let newOutputData;
    if (button === RateButtons.like) {
      newOutputData = { Like: !output.Like, Dislike: false };
    } else {
      newOutputData = { Like: false, Dislike: !output.Dislike };
    }

    updateOutputFn(db, output.OutputID, newOutputData)
      .then((output) => {
        if (isChain) {
          dispatch(
            updateReduxOutput({
              chainId: (output as OutputType).ChainID,
              id: output.OutputID,
              output,
            })
          );
        } else {
          dispatch(
            updateReduxWorkflowOutput({
              workflowId: (output as WorkflowOutputType).WorkflowID,
              id: output.OutputID,
              workflowOutput: output as WorkflowOutputType,
            })
          );
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.actions}>
        <Button
          type={ButtonTypes.icon}
          onClick={() => handleOutputRating(RateButtons.like)}
        >
          <LikeIcon />
        </Button>
        <Button
          type={ButtonTypes.icon}
          onClick={() => handleOutputRating(RateButtons.dislike)}
        >
          <DislikeIcon />
        </Button>
      </div>
      <div className={styles.actions}>
        <Button type={ButtonTypes.icon} onClick={copyTextToClipboard}>
          <CopyIcon />
        </Button>
        <Button
          type={ButtonTypes.icon}
          onClick={() => handleDeleteOutput(output.OutputID)}
        >
          <DeleteIcon />
        </Button>
      </div>
    </div>
  );
};
