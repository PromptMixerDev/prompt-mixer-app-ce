import React, { useContext, useEffect, useState, useRef } from 'react';
import { WorkspaceDatabaseContext } from 'contexts';
import {
  CompositeDecorator,
  Editor,
  EditorState,
  convertToRaw,
  type DraftHandleValue,
} from 'draft-js';
import {
  useAppDispatch,
  useAppSelector,
  useResizeObserver,
  useWindowResize,
} from 'hooks';
import { DICTIONARY } from 'dictionary';
import { type Variable } from 'db/workspaceDb';
import { type PromptItemType } from 'store/prompts/promptsSlice';
import {
  beforeInputHandler,
  datasetLinkStrategy,
  getDatasetContextMenuOptions,
  handleCommentsView,
  handleDatasetPopupVisibility,
  initEditorAndPromptsMap,
  keyBindingFn,
  keyCommandHandler,
  processContent,
  updatePromptItemsPosition,
  variableStrategy,
} from './EditorArea.helper';
import { PromptItemInfo } from '../PromptItemInfo';
import { ContextMenuWithOptions } from '../../Modals/ContextMenuWithOptions';
import { AlignValues, type ClientRect } from '../../Modals/ContextMenu';
import styles from './EditorArea.module.css';
import './EditorArea.custom.css';

interface EditorAreaProps {
  tabId: string;
  promptItems: PromptItemType[];
  chainId?: string;
  selectedEntityId?: string;
  handleCreateChainModel: () => Promise<string>;
  variables: Variable[];
}

interface ComponentProps {
  children: React.ReactNode;
}

export interface DatasetMetadata {
  start: number;
  end: number;
  blockKey: string;
  text: string;
}

const PurpleComponent: React.FC<ComponentProps> = ({ children }) => {
  return <span style={{ color: 'var(--purple-6)' }}>{children}</span>;
};

export const compositeDecorator = new CompositeDecorator([
  {
    strategy: datasetLinkStrategy,
    component: PurpleComponent,
  },
  {
    strategy: variableStrategy,
    component: PurpleComponent,
  },
]);

export const EditorArea: React.FC<EditorAreaProps> = ({
  tabId,
  promptItems,
  selectedEntityId,
  handleCreateChainModel,
  variables,
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const editorRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const { datasetsInfo } = useAppSelector((state) => state.dataset);
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createEmpty()
  );
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectionRect, setSelectionRect] = useState<ClientRect | undefined>();
  const [datasetMetadata, setDatasetMetadata] = useState<
    DatasetMetadata | undefined
  >();
  const [promptItemsMap, setPromptItemsMap] = useState<
    Record<string, string[]>
  >({});
  const [promptItemsPosition, setPromptItemsPosition] = useState<
    Record<
      string,
      {
        top: number;
        left: number;
        right: number;
      }
    >
  >({});

  const handlePromptItemsPosition = (): void =>
    updatePromptItemsPosition(
      editorRef,
      promptItems,
      promptItemsMap,
      setPromptItemsPosition
    );
  const isDefaultPrompt = 'Default' in promptItems[0];

  useEffect(() => {
    initEditorAndPromptsMap(
      promptItems,
      setEditorState,
      setPromptItemsMap,
      compositeDecorator
    );
  }, []);

  useEffect(() => {
    handlePromptItemsPosition();
  }, [promptItems, promptItemsMap]);

  useResizeObserver(editorRef, handlePromptItemsPosition);
  useWindowResize(handlePromptItemsPosition);

  const handleEditorChange = (newState: EditorState): void => {
    setEditorState(newState);
    const currentContent = newState.getCurrentContent();
    const plainText = currentContent.getPlainText();
    if (isDefaultPrompt && !plainText) return;
    const rawCurrentContent = convertToRaw(currentContent);

    if (!selectedEntityId) {
      handleCreateChainModel()
        .then((selectedEntityId) =>
          processContent(
            db,
            rawCurrentContent,
            promptItems,
            promptItemsMap,
            selectedEntityId,
            datasetsInfo,
            dispatch,
            setPromptItemsMap,
            variables
          )
        )
        .catch((error) => {
          console.error(error);
        });
    } else {
      processContent(
        db,
        rawCurrentContent,
        promptItems,
        promptItemsMap,
        selectedEntityId,
        datasetsInfo,
        dispatch,
        setPromptItemsMap,
        variables
      );
    }

    handleDatasetPopupVisibility(
      newState,
      currentContent,
      setShowPopup,
      setSelectionRect,
      setDatasetMetadata
    );
  };

  const handleKeyCommand = (
    command: string,
    editorState: EditorState
  ): DraftHandleValue => {
    const res = keyCommandHandler(command, editorState, setEditorState);
    return res;
  };

  const reinitEditorAndPromptsMap = (): void =>
    initEditorAndPromptsMap(
      promptItems,
      setEditorState,
      setPromptItemsMap,
      compositeDecorator
    );

  useEffect(() => {
    handleCommentsView(
      editorState,
      promptItems,
      promptItemsMap,
      styles.comment as string
    );
  }, [editorState, promptItems]);

  useEffect(() => {
    if (tabId !== selectedEntityId) {
      setShowPopup(false);
    }
  }, [tabId, selectedEntityId]);

  return (
    <div id={tabId} className={styles.wrapper} ref={editorRef}>
      <div className={styles.editor}>
        <Editor
          placeholder={
            isDefaultPrompt ? DICTIONARY.placeholders.enterPrompt : undefined
          }
          editorState={editorState}
          onChange={handleEditorChange}
          handleBeforeInput={beforeInputHandler(
            setEditorState,
            setShowPopup,
            setSelectionRect,
            setDatasetMetadata
          )}
          stripPastedStyles={true}
          keyBindingFn={keyBindingFn}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
      {promptItems.map((promptItem, ind) => {
        const position = promptItemsPosition[promptItem.PromptID];
        return (
          position && (
            <PromptItemInfo
              index={ind}
              key={promptItem.PromptID}
              promptItem={promptItem}
              position={position}
              chainId={selectedEntityId}
              isDefaultPrompt={isDefaultPrompt}
              reinitEditorAndPromptsMap={reinitEditorAndPromptsMap}
            />
          )
        );
      })}
      {showPopup && !!datasetsInfo.length && (
        <ContextMenuWithOptions
          optionGroups={getDatasetContextMenuOptions(
            editorState,
            datasetsInfo,
            datasetMetadata,
            setShowPopup,
            setEditorState
          )}
          onClose={() => setShowPopup(false)}
          align={AlignValues.UNDER_CENTER}
          rect={selectionRect}
        />
      )}
    </div>
  );
};
