import React, { useContext, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector, usePortal } from 'hooks';
import { WorkspaceDatabaseContext } from 'contexts';
import { DICTIONARY } from 'dictionary';
import { ReactComponent as FileAddIcon } from 'assets/icons/file-add.svg';
import { ReactComponent as FolderAddIcon } from 'assets/icons/folder-add.svg';
import { ReactComponent as MoreIcon } from 'assets/icons/more.svg';
import { Button, ButtonTypes } from '../../Button';
import { ContextMenuWithOptions } from '../../Modals/ContextMenuWithOptions';
import { AlignValues } from '../../Modals/ContextMenu';
import { getContextMenuOptions } from './TreeButtons.helper';
import { ConfimationModal } from '../../Modals/ConfimationModal';
import { createEmptyCollection, deleteAllTreeItems } from '../Tree.helper';
import { createPromptChain } from '../../FlexLayout/FlexLayout.helper';
import styles from './TreeButtons.module.css';

interface TreeButtonsProps {
  buttonPosition: { top: number; left: number };
}

export const TreeButtons: React.FC<TreeButtonsProps> = ({
  buttonPosition: { top, left },
}) => {
  const db = useContext(WorkspaceDatabaseContext)!;
  const dispatch = useAppDispatch();
  const { model } = useAppSelector((store) => store.flexLayoutModel);
  const { render } = usePortal();
  const moreButtonRef = useRef(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  return render(
    <>
      <div className={styles.buttons} style={{ top, left }}>
        <Button
          id="create-chain-button"
          type={ButtonTypes.icon}
          onClick={() => createPromptChain(db, model, dispatch)}
        >
          <FileAddIcon className={styles.libraryIcon} />
        </Button>
        <Button
          id="create-collection-button"
          type={ButtonTypes.icon}
          onClick={() => createEmptyCollection(db, dispatch)}
        >
          <FolderAddIcon className={styles.libraryIcon} />
        </Button>
        <Button
          id="more-button"
          type={ButtonTypes.icon}
          onClick={() => setShowMenu(!showMenu)}
          ref={moreButtonRef}
        >
          <MoreIcon className={styles.libraryIcon} />
        </Button>
      </div>
      {showMenu && (
        <ContextMenuWithOptions
          optionGroups={getContextMenuOptions(
            db,
            model,
            dispatch,
            setShowConfirmModal
          )}
          onClose={() => setShowMenu(false)}
          ignoreElementRef={moreButtonRef}
          triggerRef={moreButtonRef}
          align={AlignValues.UNDER_CENTER}
        />
      )}
      {showConfirmModal && (
        <ConfimationModal
          text={DICTIONARY.questions.areYouWantToDeleteAll}
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            deleteAllTreeItems(db, model, dispatch);
          }}
        />
      )}
    </>
  );
};
