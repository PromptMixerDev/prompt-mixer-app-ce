import React from 'react';
import { ReactComponent as AddIcon } from 'assets/icons/add.svg';
import { AlignValues, ContextMenu } from '../../../Modals/ContextMenu';
import styles from './VersionContextMenu.module.css';
import { Button, ButtonTypes } from 'components/Button';
import { DICTIONARY } from 'dictionary';
import { type PromptVersion } from 'db/workspaceDb';
import { Toggle } from 'components/Toggle';

interface VersionContextMenuProps {
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  ignoreElementRef?: React.RefObject<HTMLElement>;
  versions: PromptVersion[];
  activeVersionId: string;
  addVersion: () => void;
  changeActiveVersion: (value: string) => void;
}

export const VersionContextMenu: React.FC<VersionContextMenuProps> = ({
  onClose,
  triggerRef,
  ignoreElementRef,
  versions,
  activeVersionId,
  addVersion,
  changeActiveVersion,
}) => {
  return (
    <ContextMenu
      onClose={onClose}
      align={AlignValues.RIGHT_CENTER}
      triggerRef={triggerRef}
      ignoreElementRef={ignoreElementRef}
    >
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <Button
            type={ButtonTypes.iconText}
            buttonClass={styles.button}
            onClick={addVersion}
          >
            <AddIcon />
            <span>{DICTIONARY.labels.addVersion}</span>
          </Button>
        </div>
        <div className={styles.versions}>
          {versions.map((version) => {
            const isOn = version.VersionID === activeVersionId;
            return (
              <div className={styles.version} key={version.VersionID}>
                <div
                  className={styles.number}
                >{`${version.VersionNumber}.`}</div>
                <div className={styles.content}>{version.Content}</div>
                <div className={styles.toggle}>
                  <Toggle
                    isOn={isOn}
                    onToggle={() =>
                      !isOn && changeActiveVersion(version.VersionID)
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ContextMenu>
  );
};
