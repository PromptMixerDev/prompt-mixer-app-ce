/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useRef } from 'react';
import classnames from 'classnames';
import { DICTIONARY } from 'dictionary';
import { useAppDispatch } from 'hooks';
import { ReactComponent as TimerIcon } from 'assets/icons/timer.svg';
import { ReactComponent as InfoIcon } from 'assets/icons/info.svg';
import { ReactComponent as GreenCircleIcon } from 'assets/icons/green-circle.svg';
import { convertDate } from 'utils/convertDate';
import { updateOutput, type OutputType } from 'store/outputs/outputsSlice';
import {
  updateWorkflowOutput,
  type WorkflowOutputType,
} from 'store/workflowOutputs/workflowOutputsSlice';
import { Button, ButtonTypes } from '../../Button';
import { OutputActions } from '../OutputActions';
import { getCompletionTime } from './Output.helper';
import { MarkdownContent } from '../MarkdownContent';
import { JSONContent } from '../JSONContent';
import { getModelInfo } from '../../ModelsSelector/Model/Model.helper';
import { ErrorSteps } from '../ErrorSteps';
import styles from './Output.module.css';

interface OutputProps {
  output: OutputType | WorkflowOutputType;
  handleDeleteOutput: (id: string) => void;
  entityId: string;
  isChain: boolean;
}

const TOOL_CALLS_FINISH_REASON = 'tool_calls';

export const Output: React.FC<OutputProps> = ({
  output,
  handleDeleteOutput,
  entityId,
  isChain,
}) => {
  const dispatch = useAppDispatch();
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const activeStep = output.activeStep;
  const finishReason = output.Completions?.[activeStep]?.FinishReason;
  const isShowVersions =
    isChain &&
    (output as OutputType).PromptVersions.length === output.Completions.length;

  const completionTime = getCompletionTime(output);
  const model = isChain
    ? (output as OutputType).ModelType
    : (output as WorkflowOutputType).Completions[activeStep].ModelType;
  const properties = isChain
    ? (output as OutputType).Properties
    : (output as WorkflowOutputType).Completions[activeStep].Properties;
  const connectorName = isChain
    ? (output as OutputType).ConnectorName
    : (output as WorkflowOutputType).Completions[activeStep].ConnectorName;
  const info = getModelInfo(model, properties, connectorName);

  const onClick = (step: number): void => {
    if (isChain) {
      dispatch(
        updateOutput({
          chainId: entityId,
          id: output.OutputID,
          output: { activeStep: step },
        })
      );
    } else {
      dispatch(
        updateWorkflowOutput({
          workflowId: entityId,
          id: output.OutputID,
          workflowOutput: { activeStep: step },
        })
      );
    }
  };

  const copyTextToClipboard = async (): Promise<void> => {
    if (contentWrapperRef.current) {
      const textToCopy =
        output.Completions?.[output.activeStep]?.Content ??
        contentWrapperRef.current.textContent ??
        '';

      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch (err) {
        console.error('Failed to copy text to clipboard', err);
      }
    }
  };

  return (
    <>
      <div
        className={classnames(
          styles.wrapper,
          output.Like && styles.like,
          output.Dislike && styles.dislike
        )}
      >
        <div className={styles.info}>
          <div
            className={classnames(
              styles.modelInfo,
              output.Like && styles.likeModelInfo,
              output.Dislike && styles.dislikeModelInfo
            )}
          >
            {isChain
              ? info
              : `${(output as WorkflowOutputType).Completions[activeStep].ChainName}, ${info}`}
          </div>
          <div className={styles.date}>{convertDate(output.CreatedAt)}</div>
        </div>
        <div className={styles.controlBlock}>
          <div className={styles.stepButtons}>
            {output.Completions?.map((item, ind) => (
              <div key={ind}>
                <Button
                  type={ButtonTypes.text}
                  onClick={() => onClick(ind)}
                  buttonClass={`${styles.stepButton} ${ind === activeStep ? styles.activeStepButton : ''}`}
                >
                  {isShowVersions
                    ? `${(output as OutputType).PromptVersions[ind][0]} v.${(output as OutputType).PromptVersions[ind][1]}`
                    : ind + 1}
                </Button>
              </div>
            ))}
          </div>
          <div className={styles.actionsWrapper}>
            <OutputActions
              isChain={isChain}
              output={output}
              handleDeleteOutput={handleDeleteOutput}
              copyTextToClipboard={copyTextToClipboard}
            />
          </div>
        </div>
        <div ref={contentWrapperRef}>
          {output.Error && (
            <div className={styles.error}>
              <InfoIcon />
              <div>
                {output.Error}
                <ErrorSteps />
              </div>
            </div>
          )}
          {!output.Error && output.Loading && (
            <div className={styles.outputLoading}>
              <GreenCircleIcon />
              <div>{DICTIONARY.placeholders.loadingOutput}</div>
            </div>
          )}
          {!output.Error &&
            !output.Loading &&
            output.Completions?.[activeStep]?.Content && (
              <div className={styles.content}>
                {finishReason === TOOL_CALLS_FINISH_REASON ? (
                  <JSONContent
                    content={output.Completions?.[activeStep]?.Content}
                  />
                ) : (
                  <MarkdownContent
                    content={output.Completions?.[activeStep]?.Content}
                  />
                )}
              </div>
            )}
          {!output.Error &&
            !output.Loading &&
            output.Completions?.[activeStep]?.Error && (
              <div className={styles.error}>
                <InfoIcon />
                <div>
                  {output.Completions?.[activeStep]?.Error}
                  <ErrorSteps />
                </div>
              </div>
            )}
        </div>
        <div className={styles.footer}>
          {completionTime && (
            <div className={styles.time}>
              <TimerIcon />
              <div>{completionTime}</div>
            </div>
          )}
          {output.Completions?.[activeStep]?.TokenUsage && (
            <div
              className={styles.tokens}
            >{`T ${output.Completions?.[activeStep]?.TokenUsage}`}</div>
          )}
        </div>
      </div>
    </>
  );
};
