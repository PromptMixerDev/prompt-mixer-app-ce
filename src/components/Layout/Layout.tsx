/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useContext, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  type ListRowProps,
} from 'react-virtualized';
import {
  deleteAllOutputs,
  deleteAllWorkflowOutputs,
  deleteOutput,
  deleteWorkflowOutput,
} from 'db/workspaceDb';
import { WorkspaceDatabaseContext, NotificationsContext } from 'contexts';
import { ReactComponent as MoreIcon } from 'assets/icons/more.svg';
import { ReactComponent as FilterIcon } from 'assets/icons/filter.svg';
import { ReactComponent as StarsIcon } from 'assets/icons/stars.svg';
import { DICTIONARY } from 'dictionary';
import { useAppDispatch, useAppSelector, useResizeObserver } from 'hooks';
import {
  selectOutputsByChainId,
  selectOutputModelsByChainId,
} from 'store/outputs/outputsSelectors';
import { EntityType } from 'store/selectedEntity/selectedEntitySlice';
import { selectWorkflowOutputsByWorkflowId } from 'store/workflowOutputs/workflowOutputsSelectors';
import { ContextMenuWithOptions } from '../Modals/ContextMenuWithOptions';
import { AlignValues } from '../Modals/ContextMenu';
import {
  getDotMenuOptions,
  readAndSetOutputs,
  readAndSetWorkflowOutputs,
} from './Layout.helper';
import { Button, ButtonSize, ButtonTypes } from '../Button';
import { OutputFilter } from './OutputFilter';
import { Output } from './Output';
import styles from './Layout.module.css';

const maxOutputLength = 50;

export const Layout: React.FC = () => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const listRef = useRef<any>(null);
  const { addNotification } = useContext(NotificationsContext)!;
  const dotButtonRef = useRef(null);
  const dispatch = useAppDispatch();
  const { selectedEntityId, selectedEntityType } = useAppSelector(
    (state) => state.selectedEntity
  );
  const chainOutputs = useAppSelector(selectOutputsByChainId(selectedEntityId));
  const chainModels = useAppSelector(
    selectOutputModelsByChainId(selectedEntityId)
  );
  const workflowOutputs = useAppSelector(
    selectWorkflowOutputsByWorkflowId(selectedEntityId)
  );
  const [dotMenuVisible, setDotMenuVisible] = useState(false);
  const [showOutputFiler, setShowOutputFiler] = useState(true);
  const isChain = selectedEntityType === EntityType.promptChain;

  const readOutputsFunction = isChain
    ? readAndSetOutputs
    : readAndSetWorkflowOutputs;
  const deleteOutputFn = isChain ? deleteOutput : deleteWorkflowOutput;
  const deleteAllOutputsFn = isChain
    ? deleteAllOutputs
    : deleteAllWorkflowOutputs;
  const outputs = isChain ? chainOutputs : workflowOutputs;

  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 100,
  });

  useEffect(() => {
    if (selectedEntityId) {
      readOutputsFunction(db, selectedEntityId, dispatch);
    }
  }, [selectedEntityId]);

  const handleDeleteOutput = (id: string): void => {
    deleteOutputFn(db, id)
      .then(() => readOutputsFunction(db, selectedEntityId!, dispatch))
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteAllOutputs = (): void => {
    if (selectedEntityId) {
      deleteAllOutputsFn(db, selectedEntityId)
        .then(() => readOutputsFunction(db, selectedEntityId, dispatch))
        .catch((error) => {
          console.error(error);
        });
    }
  };

  useResizeObserver(listRef, () => cache.clearAll());

  const rowRenderer = ({
    index,
    key,
    style,
    parent,
  }: ListRowProps): React.ReactNode => {
    const output = outputs[index];
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={`${key}_${output.OutputID}`}
        rowIndex={index}
        parent={parent}
      >
        <div style={style}>
          <Output
            output={output}
            isChain={isChain}
            handleDeleteOutput={handleDeleteOutput}
            entityId={selectedEntityId!}
          />
        </div>
      </CellMeasurer>
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <Button type={ButtonTypes.icon} size={ButtonSize.m} onClick={() => {}}>
          <FilterIcon onClick={() => setShowOutputFiler(!showOutputFiler)} />
        </Button>
        <Button
          ref={dotButtonRef}
          type={ButtonTypes.icon}
          size={ButtonSize.m}
          onClick={() => setDotMenuVisible(!dotMenuVisible)}
        >
          <MoreIcon />
        </Button>
      </div>
      {isChain && showOutputFiler && (
        <OutputFilter models={chainModels} isDisabled={!chainModels.length} />
      )}
      {dotMenuVisible && (
        <ContextMenuWithOptions
          optionGroups={getDotMenuOptions(
            outputs,
            setDotMenuVisible,
            addNotification,
            handleDeleteAllOutputs
          )}
          onClose={() => setDotMenuVisible(false)}
          ignoreElementRef={dotButtonRef}
          triggerRef={dotButtonRef}
          align={AlignValues.UNDER_CENTER}
        />
      )}
      <div
        className={classnames(
          styles.content,
          showOutputFiler && styles.withFilter
        )}
        ref={listRef}
      >
        {!selectedEntityId || !outputs.length ? (
          <div className={styles.placeholder}>
            <StarsIcon />
            {DICTIONARY.placeholders.emptyOutput}
          </div>
        ) : outputs.length > maxOutputLength ? (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                deferredMeasurementCache={cache}
                rowCount={outputs.length}
                rowHeight={cache.rowHeight}
                rowRenderer={rowRenderer}
                overscanRowCount={4}
              />
            )}
          </AutoSizer>
        ) : (
          outputs.map((item) => (
            <Output
              entityId={selectedEntityId}
              key={item.OutputID}
              isChain={isChain}
              output={item}
              handleDeleteOutput={handleDeleteOutput}
            />
          ))
        )}
      </div>
    </div>
  );
};
