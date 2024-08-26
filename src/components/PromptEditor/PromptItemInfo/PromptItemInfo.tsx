/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useContext, useRef, useState, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import classNames from 'classnames';
import { getEncoding } from 'js-tiktoken';
import { DICTIONARY } from 'dictionary';
import { useAppDispatch, usePrevious } from 'hooks';
import {
  type PromptVersion,
  getPromptVersionsById,
  addPromptVersion,
  updatePrompt,
} from 'db/workspaceDb';
import { WorkspaceDatabaseContext } from 'contexts';
import { VersionContextMenu } from './VersionContextMenu';
import { VersionButton } from '../../VersionButton';
import { type PromptItemType } from 'store/prompts/promptsSlice';
import { readAndSetPrompts } from '../PromptEditor.helper';
import styles from './PromptItemInfo.module.css';

const DEFAULT_ENCODER = 'gpt2';

interface PromptItemInfoProps {
  index: number;
  promptItem: PromptItemType;
  position: {
    top: number;
    left: number;
    right: number;
  };
  chainId?: string;
  isDefaultPrompt: boolean;
  reinitEditorAndPromptsMap: () => void;
}

const enc = getEncoding(DEFAULT_ENCODER);

export const PromptItemInfo: React.FC<PromptItemInfoProps> = ({
  index,
  promptItem,
  position,
  chainId,
  isDefaultPrompt,
  reinitEditorAndPromptsMap,
}) => {
  const dispatch = useAppDispatch();
  const versionButtonRef = useRef(null);
  const db = useContext(WorkspaceDatabaseContext)!;
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const prevActiveVersionId = usePrevious(promptItem.ActiveVersionID);
  const prevPromptId = usePrevious(promptItem.PromptID);

  const handleAddVersion = (): void => {
    addPromptVersion(
      db,
      promptItem.PromptID,
      promptItem.Content,
      versions.length + 1
    )
      .then(() => {
        readAndSetPrompts(db, chainId!, dispatch);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleChangeActiveVersion = (versionId: string): void => {
    updatePrompt(db, promptItem.PromptID, { ActiveVersionID: versionId })
      .then(() => {
        readAndSetPrompts(db, chainId!, dispatch);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (showMenu) {
      getPromptVersionsById(db, promptItem.PromptID)
        .then((promptVersions: PromptVersion[]) => setVersions(promptVersions))
        .catch((error) => {
          console.error(error);
        });
    }
  }, [promptItem.ActiveVersionID, showMenu]);

  useEffect(() => {
    if (
      !isUndefined(prevActiveVersionId) &&
      !isEqual(prevActiveVersionId, promptItem.ActiveVersionID) &&
      isEqual(prevPromptId, promptItem.PromptID)
    ) {
      reinitEditorAndPromptsMap();
    }
  }, [prevActiveVersionId, promptItem.ActiveVersionID]);

  return (
    <>
      <div
        className={classNames(styles.number, isDefaultPrompt && styles.hidden)}
        style={{ top: position?.top, left: position?.left }}
      >
        {index + 1}
      </div>
      <div
        className={styles.wrapper}
        style={{ top: position?.top, right: position?.right }}
      >
        <div
          className={classNames(styles.info, isDefaultPrompt && styles.hidden)}
        >
          <VersionButton
            ref={versionButtonRef}
            number={promptItem.VersionNumber}
            onClick={() => setShowMenu(!showMenu)}
          />
          <div className={styles.tokens}>
            {DICTIONARY.labels.tokens}:{enc.encode(promptItem.Content).length}
          </div>
        </div>
        {showMenu && (
          <VersionContextMenu
            onClose={() => setShowMenu(false)}
            ignoreElementRef={versionButtonRef}
            triggerRef={versionButtonRef}
            versions={versions}
            activeVersionId={promptItem.ActiveVersionID}
            addVersion={handleAddVersion}
            changeActiveVersion={handleChangeActiveVersion}
          />
        )}
      </div>
    </>
  );
};
