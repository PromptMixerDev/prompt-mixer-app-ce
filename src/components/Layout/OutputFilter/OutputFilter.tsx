import React, { useEffect, useRef, useState } from 'react';
import { DICTIONARY } from 'dictionary';
import { useAppDispatch } from 'hooks';
import {
  clearFilters,
  FilterType,
  OutputFilters,
  updateFilterOption,
  updateSearchFilter,
} from 'store/outputs/outputsSlice';

import { Button, ButtonTypes } from 'components/Button';
import { SearchField } from 'components/SearchField';
import { ContextMenuWithCheckboxes } from 'components/Modals/ContextMenuWithCheckboxes';
import { AlignValues } from 'components/Modals/ContextMenu';
import { getOptions } from './OutputFilter.helper';
import styles from './OutputFilter.module.css';

interface OutputFilterProps {
  chainId?: string;
  filters: OutputFilters | null;
  isDisabled: boolean;
}

export const OutputFilter: React.FC<OutputFilterProps> = ({
  chainId,
  filters,
  isDisabled,
}) => {
  const dispatch = useAppDispatch();
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

  useEffect(() => {
    const checkedModelFilters =
      filters?.model.filter((item) => item.checked) ?? [];
    if (!checkedModelFilters.length) {
      setModelFilterValue(DICTIONARY.labels.allModels);
    } else {
      setModelFilterValue(
        checkedModelFilters.map((item) => item.name).join(',')
      );
    }

    const checkedRatingFilters =
      filters?.rating.filter((item) => item.checked) ?? [];
    if (!checkedRatingFilters.length) {
      setRatingFilterValue(DICTIONARY.labels.allRating);
    } else {
      setRatingFilterValue(
        checkedRatingFilters.map((item) => item.name).join(', ')
      );
    }
  }, [filters]);

  const handleUpdateFilterOption = (
    filterType: FilterType,
    optionName: string
  ) => {
    dispatch(
      updateFilterOption({
        chainId: chainId!,
        filterType,
        optionName,
      })
    );
  };

  const handleSearch = (key: string) => {
    dispatch(updateSearchFilter({ chainId: chainId!, searchKey: key }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters({ chainId: chainId! }));
  };

  return (
    <div className={styles.container}>
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
          <div className={styles.filterValue}>{modelFilterValue}</div>
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
          <div className={styles.filterValue}>{ratingFilterValue}</div>
        </Button>
        <SearchField
          onSearch={handleSearch}
          searchFieldClass={styles.search}
          placeholder={DICTIONARY.placeholders.searchOrTextExpression}
          externalSeachKey={filters?.search ?? ''}
        />
        <Button
          type={ButtonTypes.text}
          buttonWrapperClass={styles.clearButton}
          onClick={handleClearFilters}
          disabled={isDisabled}
        >
          {DICTIONARY.labels.clearFilters}
        </Button>
      </div>
      {!isDisabled && openModelFilter && (
        <ContextMenuWithCheckboxes
          options={getOptions(
            filters?.model,
            handleUpdateFilterOption,
            FilterType.model
          )}
          onClose={() => setOpenModelFilter(false)}
          ignoreElementRef={modelsFilterRef}
          triggerRef={modelsFilterRef}
          align={AlignValues.UNDER}
        />
      )}
      {!isDisabled && openRatingFilter && (
        <ContextMenuWithCheckboxes
          options={getOptions(
            filters?.rating,
            handleUpdateFilterOption,
            FilterType.rating
          )}
          onClose={() => setOpenRatingFilter(false)}
          ignoreElementRef={ratingFilterRef}
          triggerRef={ratingFilterRef}
          align={AlignValues.UNDER}
        />
      )}
    </div>
  );
};
