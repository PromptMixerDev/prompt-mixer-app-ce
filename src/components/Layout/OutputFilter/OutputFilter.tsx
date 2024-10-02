import React, { useRef, useState } from 'react';
import { DICTIONARY } from 'dictionary';
import { Button, ButtonTypes } from 'components/Button';
import { SearchField } from 'components/SearchField';
import { ContextMenuWithCheckboxes } from 'components/Modals/ContextMenuWithCheckboxes';
import { AlignValues } from 'components/Modals/ContextMenu';
import { getModelOptions, getRatingOptions } from './OutputFilter.helper';
import styles from './OutputFilter.module.css';

interface OutputFilterProps {
  models: string[];
  isDisabled: boolean;
}

export const OutputFilter: React.FC<OutputFilterProps> = ({
  models,
  isDisabled,
}) => {
  const modelsFilterRef = useRef<HTMLDivElement | null>(null);
  const ratingFilterRef = useRef<HTMLDivElement | null>(null);
  const [modelFilterValue, setModelFilterValue] = useState(
    DICTIONARY.labels.allModels
  );
  const [ratingFilterValue, setRatingFilterValue] = useState(
    DICTIONARY.labels.allRating
  );
  const [openModelFilter, setOpenModelFilter] = useState(false);
  const [openRatingFilter, setOpenRatingFilter] = useState(false);

  console.log(setModelFilterValue, setRatingFilterValue);

  return (
    <>
      <div className={styles.wrapper}>
        <Button
          ref={modelsFilterRef}
          type={ButtonTypes.text}
          buttonWrapperClass={styles.button}
          onClick={() => {
            setOpenModelFilter(!openModelFilter);
          }}
          disabled={isDisabled}
        >
          <span>{modelFilterValue}</span>
        </Button>
        <Button
          ref={ratingFilterRef}
          type={ButtonTypes.text}
          buttonWrapperClass={styles.button}
          onClick={() => {
            setOpenRatingFilter(!openRatingFilter);
          }}
          disabled={isDisabled}
        >
          <span>{ratingFilterValue}</span>
        </Button>
        <SearchField
          onSearch={() => {}}
          searchFieldClass={styles.search}
          placeholder={DICTIONARY.placeholders.searchOrTextExpression}
        />
        <Button
          type={ButtonTypes.text}
          buttonWrapperClass={styles.clearButton}
          onClick={() => {}}
          disabled={isDisabled}
        >
          <span>{DICTIONARY.labels.clearFilters}</span>
        </Button>
      </div>
      {openModelFilter && (
        <ContextMenuWithCheckboxes
          options={getModelOptions(models, () => {})}
          onClose={() => setOpenModelFilter(false)}
          ignoreElementRef={modelsFilterRef}
          triggerRef={modelsFilterRef}
          align={AlignValues.UNDER}
        />
      )}
      {openRatingFilter && (
        <ContextMenuWithCheckboxes
          options={getRatingOptions(() => {})}
          onClose={() => setOpenRatingFilter(false)}
          ignoreElementRef={ratingFilterRef}
          triggerRef={ratingFilterRef}
          align={AlignValues.UNDER}
        />
      )}
    </>
  );
};
