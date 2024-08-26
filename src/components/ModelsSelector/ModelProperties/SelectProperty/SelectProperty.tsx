import React, { useEffect, useState } from 'react';
import groupBy from 'lodash/groupBy';
import { ReactComponent as ArrowDownIcon } from 'assets/icons/arrow-down.svg';
import { ReactComponent as AiIcon } from 'assets/icons/ai.svg';
import { useOutsideClick } from 'hooks';
import { DICTIONARY } from 'dictionary';
import { isSameModel } from './SelectProperty.helper';
import {
  type ModelOption,
  type IModel,
} from 'components/ModelsSelector/ModelsSelector';
import { SearchField } from 'components/SearchField';
import styles from './SelectProperty.module.css';
interface SelectOptionProps {
  modelOptions: ModelOption[];
  selectedModel: IModel | undefined;
  onChange: (value: ModelOption) => void;
}

export const SelectProperty: React.FC<SelectOptionProps> = ({
  modelOptions,
  selectedModel,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredModelOptions, setFilteredModelOptions] =
    useState(modelOptions);

  const modelGroups = groupBy(filteredModelOptions, 'ConnectorFolder');

  const toggleDropdown = (): void => {
    setFilteredModelOptions(modelOptions);
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (modelOption: ModelOption): void => {
    if (!isSameModel(modelOption, selectedModel)) {
      onChange(modelOption);
    }
    setIsOpen(false);
  };

  const handleSearch = (key: string): void => {
    setFilteredModelOptions(
      modelOptions.filter((option) =>
        option.Model?.toLowerCase().includes(key.toLowerCase())
      )
    );
  };

  const ref = useOutsideClick(() => setIsOpen(false));

  useEffect(() => {
    setFilteredModelOptions(modelOptions);
  }, [modelOptions]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <div className={styles.label}>
        <AiIcon />
        {DICTIONARY.labels.model}
      </div>
      <div className={styles.value}>
        <div className={styles.selected} onClick={toggleDropdown}>
          {selectedModel ? (
            <>
              {selectedModel.IconBase64 && (
                <img
                  src={selectedModel.IconBase64}
                  className={styles.modelOptionIcon}
                />
              )}
              <div className={styles.selectedModel}>{selectedModel.Model}</div>
              <ArrowDownIcon className={styles.arrowIcon} />
            </>
          ) : (
            <div className={styles.placeholder}>
              {DICTIONARY.placeholders.chooseModel}
            </div>
          )}
        </div>
        {isOpen && (
          <div className={styles.modelOptionsWrapper}>
            <SearchField
              onSearch={handleSearch}
              searchFieldClass={styles.search}
            />
            <div className={styles.modelOptions}>
              {Object.values(modelGroups).map((modelGroup, ind) => (
                <div className={styles.modelGroup} key={ind}>
                  {modelGroup[0]?.ConnectorName && (
                    <div className={styles.connectorName}>
                      {modelGroup[0]?.ConnectorName}
                    </div>
                  )}
                  {modelGroup.map((modelOption, index) => (
                    <div
                      key={index}
                      className={styles.modelOption}
                      onClick={() => handleOptionClick(modelOption)}
                    >
                      {modelOption.IconBase64 && (
                        <img
                          src={modelOption.IconBase64}
                          className={styles.modelOptionIcon}
                        />
                      )}
                      {modelOption.Model}
                    </div>
                  ))}
                </div>
              ))}
              {!Object.values(modelGroups).length && (
                <div className={styles.noMatchFound}>
                  {DICTIONARY.placeholders.noMatchFound}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
