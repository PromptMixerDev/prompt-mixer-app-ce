/* eslint-disable @typescript-eslint/no-unsafe-argument */
import React, { useRef, useState } from 'react';
import { ReactComponent as MoreIcon } from 'assets/icons/more.svg';
import { ReactComponent as AddIcon } from 'assets/icons/add.svg';
import { DICTIONARY } from 'dictionary';
import { ModelProperties } from '../ModelProperties';
import { type ModelOption, type IModel } from '../ModelsSelector';
import { Button, ButtonTypes } from '../../Button';
import { ContextMenuWithOptions } from '../../Modals/ContextMenuWithOptions';
import { AlignValues } from '../../Modals/ContextMenu';
import { AccordionSection } from '../../AccordionSection';
import {
  getContextMenuOptions,
  getModelTitle,
  stringifyModelProperties,
} from './Model.helper';
import styles from './Model.module.css';

interface ModelProps {
  modelOptions: ModelOption[];
  model: IModel;
  index: number;
  modelsCount: number;
  onModelChange: (value: IModel) => void;
  onModelAdd: (order: number) => void;
  onModelDelete: (id: string, order: number) => void;
}

export const Model: React.FC<ModelProps> = ({
  model,
  index,
  modelOptions,
  modelsCount,
  onModelChange,
  onModelAdd,
  onModelDelete,
}) => {
  const dotIconRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleDotIconClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const addModel = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onModelAdd(model.Order);
  };

  const deleteModel = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onModelDelete(model.ChainModelID, model.Order);
  };

  return (
    <>
      <AccordionSection
        title={getModelTitle(modelsCount, index, model.Model)}
        custom={
          <>
            {!isOpen && (
              <div className={styles.info}>
                {stringifyModelProperties(model.Properties)}
              </div>
            )}
            {modelsCount > 1 ? (
              <Button
                type={ButtonTypes.icon}
                buttonWrapperClass={styles.rightButton}
                onClick={handleDotIconClick}
                ref={dotIconRef}
              >
                <MoreIcon />
              </Button>
            ) : (
              <Button
                type={ButtonTypes.iconText}
                buttonWrapperClass={styles.rightButton}
                buttonClass={styles.addModelButton}
                onClick={addModel}
              >
                <AddIcon />
                <span>{DICTIONARY.labels.addModel}</span>
              </Button>
            )}
          </>
        }
        onToggle={setIsOpen}
      >
        <ModelProperties
          modelOptions={modelOptions}
          model={model}
          onModelChange={onModelChange}
        />
      </AccordionSection>
      {showMenu && (
        <ContextMenuWithOptions
          optionGroups={getContextMenuOptions(deleteModel, addModel)}
          onClose={() => setShowMenu(false)}
          ignoreElementRef={dotIconRef}
          triggerRef={dotIconRef}
          align={AlignValues.UNDER_CENTER}
        />
      )}
    </>
  );
};
