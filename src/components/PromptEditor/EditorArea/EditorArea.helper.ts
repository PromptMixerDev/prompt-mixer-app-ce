import { Repeat, List } from 'immutable';
import debounce from 'lodash/debounce';
import uniq from 'lodash/uniq';
import { v4 as uuidv4 } from 'uuid';
import {
  type IDBWrapper,
  createOrUpdatePrompt,
  updatePromptChain,
  type Variable,
  createVariable,
  deleteVariable,
} from 'db/workspaceDb';
import {
  CharacterMetadata,
  ContentBlock,
  ContentState,
  type RawDraftContentBlock,
  type RawDraftContentState,
  genKey,
  EditorState,
  SelectionState,
  type BlockMap,
  Entity,
  type RawDraftEntity,
  type RawDraftEntityRange,
  type CompositeDecorator,
  type DraftHandleValue,
  Modifier,
  getVisibleSelectionRect,
  getDefaultKeyBinding,
  KeyBindingUtil,
} from 'draft-js';
import { DICTIONARY } from 'dictionary';
import { ReactComponent as DatasetIcon } from 'assets/icons/dataset.svg';
import { type AppDispatch } from 'store/store';
import {
  type PromptItemType,
  addPromptItems,
} from 'store/prompts/promptsSlice';
import { type DatasetType } from 'store/dataset/datasetSlice';
import { type IPromptItem } from '../PromptEditor';
import { type ContextMenuOption } from '../../Modals/ContextMenuWithOptions';
import { type ClientRect } from '../../Modals/ContextMenu';
import { type DatasetMetadata } from './EditorArea';
import { readAndSetVariables } from '../PromptEditor.helper';

const DIVIDER = '---';
const DATASET_LINK_TYPE = 'DATASET_LINK';
const MUTABLE = 'MUTABLE';
const CHUNK_SIZE = 1000;

const datasetLinkPattern = /\[\[(.*?)\]\]\((.*?)\)/g;
const datasetPatternGlobal = /\[\[\s*([^[\]]*)\s*\]\]/g;
export const variablePatternGlobal = /\{\{\s*([^{}]*)\s*\}\}/g;
const dividerPattern = /^---\s*$/;
const commentPattern = /^\/\//;
const bracketsPattern = /\[\[|\]\]/g;
const curlyBracketsPattern = /\{\{|\}\}/g;

const debouncedSyncPromptsWithDB = debounce((action, ...args) => {
  action(...args);
}, 500);

const debouncedProceesVariables = debounce((action, ...args) => {
  action(...args);
}, 500);

export const datasetLinkStrategy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void
): void => {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = datasetPatternGlobal.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
  datasetPatternGlobal.lastIndex = 0;
};

export const variableStrategy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void
): void => {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = variablePatternGlobal.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
  variablePatternGlobal.lastIndex = 0;
};

const handleText = (textChunk: string): CharacterMetadata[] => {
  const localCharacters = [];
  for (let i = 0; i < textChunk.length; i += CHUNK_SIZE) {
    const end = Math.min(i + CHUNK_SIZE, textChunk.length);
    const chunk = textChunk.slice(i, end);
    const chunkChars = Repeat(
      CharacterMetadata.create(),
      chunk.length
    ).toArray();
    localCharacters.push(...chunkChars);
  }
  return localCharacters;
};

const createTextBlock = (
  text: string
): { key: string; block: ContentBlock } => {
  const key = genKey();

  let matchArr;
  let lastIndex = 0;

  const characters = [];

  while ((matchArr = datasetLinkPattern.exec(text)) !== null) {
    const beforeMatch = text.slice(lastIndex, matchArr.index);
    if (beforeMatch) {
      characters.push(...handleText(beforeMatch));
    }

    const entityKey = Entity.create(DATASET_LINK_TYPE, MUTABLE, {
      id: matchArr[2],
    });
    const matchText = `[[${matchArr[1]}]]`;
    characters.push(
      ...List(
        Repeat(
          CharacterMetadata.create({ entity: entityKey }),
          matchText.length
        )
      ).toArray()
    );

    lastIndex = matchArr.index + matchArr[0].length;
  }

  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    characters.push(...handleText(remainingText));
  }

  const block = new ContentBlock({
    key,
    type: 'unstyled',
    text: text.replace(datasetLinkPattern, '[[$1]]'),
    characterList: List(characters),
  });

  return { key, block };
};

const createDividerBlock = (): ContentBlock => {
  const block = new ContentBlock({
    key: genKey(),
    type: 'unstyled',
    text: DIVIDER,
    characterList: List(Repeat(CharacterMetadata.create(), DIVIDER.length)),
  });

  return block;
};

const setEditorSelection = (state: EditorState): EditorState => {
  const firstBlockKey = state
    .getCurrentContent()
    .getBlockMap()
    .first()
    .getKey();
  const firstPositionSelection = SelectionState.createEmpty(
    firstBlockKey
  ).merge({
    anchorOffset: 0,
    focusOffset: 0,
  });

  return EditorState.forceSelection(state, firstPositionSelection);
};

export const initEditorAndPromptsMap = (
  promptItems: PromptItemType[],
  setEditorState: (value: EditorState) => void,
  setPromptItemsMap: (value: Record<string, string[]>) => void,
  compositeDecorator: CompositeDecorator
): void => {
  const blocks: ContentBlock[] = [];
  const promptItemsMap: Record<string, string[]> = {};
  promptItems.forEach((prompt, ind) => {
    const keys: string[] = [];
    const textBlocks = prompt.Content.split('\n');
    textBlocks.forEach((text: string) => {
      const { key, block } = createTextBlock(text);
      keys.push(key);
      blocks.push(block);
    });
    if (ind !== promptItems.length - 1) {
      const block = createDividerBlock();
      blocks.push(block);
    }
    promptItemsMap[prompt.PromptID] = keys;
  });

  const contentState = ContentState.createFromBlockArray(blocks);
  const editorState = EditorState.createWithContent(
    contentState,
    compositeDecorator
  );

  const editorStateWithSelection = setEditorSelection(editorState);

  setEditorState(editorStateWithSelection);
  setPromptItemsMap(promptItemsMap);
};

export const updatePromptItemsPosition = (
  editorRef: React.RefObject<HTMLElement>,
  promptItems: PromptItemType[],
  promptItemsMap: Record<string, string[]>,
  setPromptItemsPosition: (
    value: Record<
      string,
      {
        top: number;
        left: number;
        right: number;
      }
    >
  ) => void
): void => {
  const posotions: Record<
    string,
    {
      top: number;
      left: number;
      right: number;
    }
  > = {};
  const containerRect = editorRef.current?.getBoundingClientRect();
  if (!containerRect?.width) return;

  promptItems.forEach((promptItem) => {
    const promptId = promptItem.PromptID;
    const elemId = promptItemsMap[promptId]?.[0];
    const element = document.querySelector(`[data-offset-key="${elemId}-0-0"]`);
    if (element && containerRect) {
      const rect = element.getBoundingClientRect();
      if (!rect.width) return;
      posotions[promptId] = {
        top: rect.top - containerRect.top,
        left: 0,
        right: 0,
      };
    }
    setPromptItemsPosition(posotions);
  });
};

const findPromptId = (
  keys: string[],
  promptItemsMap: Record<string, string[]>
): string | undefined => {
  for (const promptId in promptItemsMap) {
    const promptKeys = promptItemsMap[promptId];

    if (promptKeys.some((promptKey) => keys.includes(promptKey))) {
      return promptId;
    }
  }
};

const findExisingPrompt = (
  keys: string[],
  promptItems: PromptItemType[],
  promptItemsMap: Record<string, string[]>
): PromptItemType | undefined => {
  const exisingPromptId = findPromptId(keys, promptItemsMap);
  if (exisingPromptId) {
    return promptItems.find((el) => el.PromptID === exisingPromptId);
  }
  return undefined;
};

const mapToPromptItem = (
  chainId: string,
  text: string,
  prompt?: PromptItemType
): IPromptItem => {
  const isEnabled = !commentPattern.test(text);
  if (prompt) {
    return {
      PromptID: prompt.PromptID,
      ChainID: chainId,
      Enabled: isEnabled,
      VersionID: prompt.VersionID,
      ActiveVersionID: prompt.ActiveVersionID,
      VersionNumber: prompt.VersionNumber,
      Content: text,
    };
  }
  const versionId = uuidv4();
  return {
    PromptID: uuidv4(),
    ChainID: chainId,
    Enabled: isEnabled,
    VersionID: versionId,
    ActiveVersionID: versionId,
    VersionNumber: 1,
    Content: text,
  };
};

const syncPromptsWithDB = (
  db: IDBWrapper,
  newPrompts: IPromptItem[],
  chainId: string
): void => {
  newPrompts.forEach((prompt) => {
    createOrUpdatePrompt(db, prompt).catch((error) => {
      console.error(error);
    });
  });

  const promptIds: string[] = newPrompts.map((prompt) => prompt.PromptID);
  updatePromptChain(db, chainId, { Prompts: promptIds }).catch((error) => {
    console.error(error);
  });
};

const buildBlockContent = (
  text: string,
  entityRanges: RawDraftEntityRange[],
  entityMap: Record<string, RawDraftEntity>,
  datasetsInfo: DatasetType[]
): string => {
  let content = text;
  const matches = content.match(datasetPatternGlobal);
  let currentIndex = 0;
  matches?.forEach((match) => {
    const title = extractTitle(match);
    const startIndex = content.indexOf(match, currentIndex);
    const insertPosition = startIndex + match.length;

    const existingEntity = entityRanges.find(
      (entity) => entity.offset === startIndex && entity.length === match.length
    );

    let datasetId: string;

    if (existingEntity) {
      datasetId = entityMap[existingEntity.key]?.data?.id;
      const dataset = datasetsInfo.find((el) => el.DatasetID === datasetId);
      if (dataset?.Title !== title) {
        datasetId = getDatasetId(datasetsInfo, title);
      }
    } else {
      datasetId = getDatasetId(datasetsInfo, title);
    }

    const datasetIdTemplate = `(${datasetId})`;
    content =
      content.slice(0, insertPosition) +
      datasetIdTemplate +
      content.slice(insertPosition);

    currentIndex = insertPosition + datasetIdTemplate.length;
  });

  return content;
};

export const extractVariableName = (str: string): string => {
  const extracted = str.replace(curlyBracketsPattern, '');
  return extracted;
};

const proceesVariables = async (
  db: IDBWrapper,
  newPrompts: IPromptItem[],
  chainId: string,
  variables: Variable[],
  dispatch: AppDispatch
): Promise<void> => {
  const newVariables = uniq(
    newPrompts
      .flatMap((newPrompt) => {
        const matches = newPrompt.Content.match(variablePatternGlobal);
        if (matches?.length) {
          return matches;
        }
        return '';
      })
      .map((value) => extractVariableName(value))
      .filter(Boolean)
  );

  const variablesToCreate = newVariables.filter(
    (item) => !variables.find((variable) => variable.Name === item)
  );
  const variablesToDetele = variables.filter(
    (variable) => !newVariables.find((item) => item === variable.Name)
  );

  try {
    await Promise.all([
      ...variablesToCreate.map(async (variable) => {
        await createVariable(db, chainId, variable);
      }),
      ...variablesToDetele.map(async (variable) => {
        await deleteVariable(db, variable.VariableID);
      }),
    ]);
    readAndSetVariables(db, chainId, dispatch);
  } catch (error) {
    console.error('proceesVariables error', error);
  }
};

const processPrompts = (
  db: IDBWrapper,
  promptBlocksToProcess: RawDraftContentBlock[][],
  entityMap: Record<string, RawDraftEntity>,
  promptItems: PromptItemType[],
  promptItemsMap: Record<string, string[]>,
  chainId: string,
  datasetsInfo: DatasetType[],
  dispatch: AppDispatch,
  setPromptItemsMap: (value: Record<string, string[]>) => void,
  variables: Variable[]
): void => {
  const newPrompts: IPromptItem[] = [];
  const newPromptMap: Record<string, string[]> = {};
  promptBlocksToProcess.forEach((promptBlocks) => {
    const keys: string[] = promptBlocks.map(
      (el: RawDraftContentBlock) => el.key
    );
    const text: string = promptBlocks
      .map((el: RawDraftContentBlock) =>
        buildBlockContent(el.text, el.entityRanges, entityMap, datasetsInfo)
      )
      .join('\n');

    const existingPrompt = findExisingPrompt(keys, promptItems, promptItemsMap);
    if (existingPrompt) {
      promptItemsMap[existingPrompt.PromptID] = [];
    }
    const newPrompt = mapToPromptItem(chainId, text, existingPrompt);
    newPrompts.push(newPrompt);
    newPromptMap[newPrompt.PromptID] = keys;
  });

  dispatch(addPromptItems({ chainId, promptItems: newPrompts }));
  setPromptItemsMap(newPromptMap);

  debouncedSyncPromptsWithDB(syncPromptsWithDB, db, newPrompts, chainId);
  debouncedProceesVariables(
    proceesVariables,
    db,
    newPrompts,
    chainId,
    variables,
    dispatch
  );
};

export const processContent = (
  db: IDBWrapper,
  rawCurrentContent: RawDraftContentState,
  promptItems: PromptItemType[],
  promptItemsMap: Record<string, string[]>,
  chainId: string,
  datasetsInfo: DatasetType[],
  dispatch: AppDispatch,
  setPromptItemsMap: (value: Record<string, string[]>) => void,
  variables: Variable[]
): void => {
  let currentPromptBlocks: RawDraftContentBlock[] = [];
  const promptBlocksToProcess: RawDraftContentBlock[][] = [];
  const { entityMap, blocks } = rawCurrentContent;

  blocks.forEach((block): void => {
    const { text } = block;
    if (!dividerPattern.test(text)) {
      currentPromptBlocks.push(block);
    }

    if (dividerPattern.test(text)) {
      if (currentPromptBlocks.length) {
        promptBlocksToProcess.push(currentPromptBlocks);
        currentPromptBlocks = [];
      } else {
        currentPromptBlocks.push(block);
      }
    }
  });

  if (currentPromptBlocks.length) {
    promptBlocksToProcess.push(currentPromptBlocks);
  }

  processPrompts(
    db,
    promptBlocksToProcess,
    entityMap,
    promptItems,
    promptItemsMap,
    chainId,
    datasetsInfo,
    dispatch,
    setPromptItemsMap,
    variables
  );
};

export const handleCommentsView = (
  editorState: EditorState,
  promptItems: PromptItemType[],
  promptItemsMap: Record<string, string[]>,
  className: string
): void => {
  const contentState: ContentState = editorState.getCurrentContent();
  const blockMap: BlockMap = contentState.getBlockMap();
  blockMap.forEach((block) => {
    const key = block?.getKey();
    const text = block?.getText();
    if (key && text) {
      const blockNode = document.querySelector(
        `[data-offset-key="${key}-0-0"]`
      );
      if (dividerPattern.test(text)) {
        blockNode?.classList.remove(className);
        return;
      }

      const promptItem = findExisingPrompt([key], promptItems, promptItemsMap);
      if (promptItem?.Enabled) {
        blockNode?.classList.remove(className);
      } else {
        blockNode?.classList.add(className);
      }
    }
  });
};

const extractTitle = (str: string): string => {
  let extracted = str.replace(bracketsPattern, '');

  if (extracted.includes('.')) {
    extracted = extracted.split('.').slice(0, -1).join('.');
  }
  return extracted;
};

const extractColumn = (str: string): string | null => {
  const extracted = str.replace(bracketsPattern, '');

  if (extracted.includes('.')) {
    const arr = extracted.split('.');
    return arr[arr.length - 1];
  }
  return null;
};

const getDatasetId = (datasetInfo: DatasetType[], title: string): string => {
  const extractedTitle = extractTitle(title);
  const match = datasetInfo.find((dataset) => dataset.Title === extractedTitle);
  return match ? match.DatasetID : '';
};

const handleInsertAndUpdate = (
  insertion: string,
  editorState: EditorState,
  selection: SelectionState
): EditorState => {
  const contentState = editorState.getCurrentContent();
  const afterInsert = Modifier.insertText(contentState, selection, insertion);
  const newState = EditorState.push(
    editorState,
    afterInsert,
    'insert-characters'
  );
  const updatedSelection = selection.merge({
    anchorOffset: selection.getStartOffset() + 1,
    focusOffset: selection.getStartOffset() + 1,
  });
  return EditorState.forceSelection(newState, updatedSelection);
};

export const beforeInputHandler =
  (
    setEditorState: (value: EditorState) => void,
    setShowPopup: (value: boolean) => void,
    setSelectionRect: (value: ClientRect) => void,
    setDatasetMetadata: (value: DatasetMetadata) => void
  ) =>
  (chars: string, editorState: EditorState): DraftHandleValue => {
    if (chars !== '[' && chars !== '{') {
      return 'not-handled';
    }

    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const currentBlock = contentState.getBlockForKey(selection.getStartKey());
    const start = selection.getStartOffset();
    const previousChar = currentBlock.getText()[start - 1];

    if (chars === '[' && start > 0 && previousChar === '[') {
      const newStateWithSelection = handleInsertAndUpdate(
        '[]]',
        editorState,
        selection
      );
      setEditorState(newStateWithSelection);
      handleDatasetPopupVisibility(
        newStateWithSelection,
        newStateWithSelection.getCurrentContent(),
        setShowPopup,
        setSelectionRect,
        setDatasetMetadata
      );
      return 'handled';
    }

    if (chars === '{' && start > 0 && previousChar === '{') {
      const newStateWithSelection = handleInsertAndUpdate(
        '{}}',
        editorState,
        selection
      );
      setEditorState(newStateWithSelection);
      return 'handled';
    }

    return 'not-handled';
  };
export const handleDatasetPopupVisibility = (
  state: EditorState,
  contentState: ContentState,
  setShowPopup: (value: boolean) => void,
  setSelectionRect: (value: ClientRect) => void,
  setDatasetMetadata: (value: DatasetMetadata) => void
): void => {
  const selectionRect = getVisibleSelectionRect(window);
  if (!selectionRect) {
    return;
  }
  const selection = state.getSelection();
  if (!selection.getHasFocus()) {
    return;
  }

  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  const startOffset = selection.getStartOffset();

  if (startKey !== endKey) {
    setShowPopup(false);
    return;
  }

  const block = contentState.getBlockForKey(startKey);
  const text = block.getText();
  let isInsideDatasetLink: boolean = false;

  let match;
  while ((match = datasetPatternGlobal.exec(text)) != null) {
    const start = match.index;
    const end = match.index + match[0].length;
    if (startOffset > start && startOffset < end) {
      isInsideDatasetLink = true;
      setDatasetMetadata({
        start,
        end,
        blockKey: startKey,
        text: match[0],
      });
    }
  }

  if (isInsideDatasetLink) {
    setSelectionRect(selectionRect);
    setShowPopup(true);
  } else {
    setShowPopup(false);
  }
};

const applyDataset = (
  editorState: EditorState,
  datasetMetadata: DatasetMetadata,
  setEditorState: (value: EditorState) => void,
  dataset?: DatasetType,
  title?: string
): void => {
  const { start, end, blockKey } = datasetMetadata;
  let newEditorState: EditorState = editorState;
  let newSelectionPosition = end;
  const selection = SelectionState.createEmpty(blockKey).merge({
    anchorOffset: start,
    focusOffset: end,
  });
  if (dataset && title) {
    let contentState = editorState.getCurrentContent();
    contentState = contentState.createEntity(DATASET_LINK_TYPE, MUTABLE, {
      id: dataset.DatasetID,
    });
    const entityKey = contentState.getLastCreatedEntityKey();
    const content = `[[${title}]]`;
    const contentStateWithNewText = Modifier.replaceText(
      contentState,
      selection,
      content,
      undefined,
      entityKey
    );

    newEditorState = EditorState.push(
      editorState,
      contentStateWithNewText,
      'insert-characters'
    );

    newSelectionPosition = start + content.length;
  }

  const newSelection = selection.merge({
    anchorOffset: newSelectionPosition,
    focusOffset: newSelectionPosition,
  });
  newEditorState = EditorState.forceSelection(newEditorState, newSelection);

  setEditorState(newEditorState);
};

export const getDatasetContextMenuOptions = (
  editorState: EditorState,
  datasetsInfo: DatasetType[],
  datasetMetadata: DatasetMetadata | undefined,
  setShowPopup: (value: boolean) => void,
  setEditorState: (value: EditorState) => void
): ContextMenuOption[][] => {
  const text = datasetMetadata?.text ?? '';
  const title = extractTitle(text);
  const column = extractColumn(text);

  const filteredDatasets = datasetsInfo.filter((dataset) =>
    dataset.Title.toLowerCase().includes(title.toLowerCase() ?? '')
  );

  const createOption = (
    datasetsInfo: DatasetType,
    label: string
  ): ContextMenuOption => ({
    label,
    icon: DatasetIcon,
    onClick: () => {
      if (datasetMetadata) {
        applyDataset(
          editorState,
          datasetMetadata,
          setEditorState,
          datasetsInfo,
          label
        );
      }
      setShowPopup(false);
    },
  });

  const createOptionsFromDatasets = (
    datasetsInfo: DatasetType[]
  ): ContextMenuOption[] => {
    return datasetsInfo.map((datasetInfo) =>
      createOption(datasetInfo, datasetInfo.Title)
    );
  };

  const createOptionsFromColumns = (
    datasetInfo: DatasetType[],
    column: string
  ): ContextMenuOption[] => {
    return datasetInfo.flatMap((dataset) => {
      const headers = dataset.Headers?.filter((header) =>
        header.toLowerCase().includes(column.toLowerCase())
      );

      return (
        headers?.map((header) =>
          createOption(dataset, `${dataset.Title}.${header}`)
        ) ?? []
      );
    });
  };

  const options =
    column === null
      ? createOptionsFromDatasets(filteredDatasets)
      : createOptionsFromColumns(filteredDatasets, column);

  if (!options.length) {
    return [
      [
        {
          label: DICTIONARY.placeholders.noMatchFound,
          onClick: () => {
            if (datasetMetadata) {
              applyDataset(editorState, datasetMetadata, setEditorState);
            }
            setShowPopup(false);
          },
        },
      ],
    ];
  }

  return [options];
};

export const keyBindingFn = (e: React.KeyboardEvent): string | null => {
  if (KeyBindingUtil.hasCommandModifier(e) && e.key === 'x') {
    return 'cut';
  }
  return getDefaultKeyBinding(e);
};

const getSelectedText = (
  contentState: ContentState,
  selection: SelectionState
): string => {
  const startKey = selection.getStartKey();
  const endKey = selection.getEndKey();
  const startOffset = selection.getStartOffset();
  const endOffset = selection.getEndOffset();

  if (startKey === endKey) {
    return contentState
      .getBlockForKey(startKey)
      .getText()
      .slice(startOffset, endOffset);
  }

  let selectedText = '';
  let blockKey = startKey;

  while (blockKey !== endKey) {
    const blockText = contentState.getBlockForKey(blockKey).getText();
    selectedText +=
      blockKey === startKey ? blockText.slice(startOffset) : blockText;
    selectedText += '\n';
    blockKey = contentState.getKeyAfter(blockKey);
  }

  selectedText += contentState
    .getBlockForKey(endKey)
    .getText()
    .slice(0, endOffset);

  return selectedText;
};

export const keyCommandHandler = (
  command: string,
  editorState: EditorState,
  setEditorState: (value: EditorState) => void
): DraftHandleValue => {
  if (command === 'cut') {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const selectedText = getSelectedText(contentState, selection);

    navigator.clipboard
      .writeText(selectedText)
      .then(() => {
        const contentStateWithEntity = Modifier.removeRange(
          contentState,
          selection,
          'backward'
        );
        const newEditorState = EditorState.push(
          editorState,
          contentStateWithEntity,
          'remove-range'
        );
        setEditorState(newEditorState);
      })
      .catch((err) => {
        console.error(err);
      });

    return 'handled';
  }
  return 'not-handled';
};
