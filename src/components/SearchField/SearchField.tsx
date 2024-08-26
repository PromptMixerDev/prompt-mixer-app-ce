/* eslint-disable @typescript-eslint/no-unsafe-argument */
import classnames from 'classnames';
import React, { useState } from 'react';
import debounce from 'lodash/debounce';
import { ReactComponent as SearchIcon } from 'assets/icons/search.svg';
import { ReactComponent as CloseIcon } from 'assets/icons/close.svg';
import { DICTIONARY } from 'dictionary';
import { Button, ButtonTypes } from 'components/Button';
import styles from './SearchField.module.css';

interface SearchFieldProps {
  onSearch: (value: string) => void;
  searchFieldClass?: string;
  placeholder?: string;
}

const debouncedFunc = debounce((action, ...args) => {
  action(...args);
}, 300);

export const SearchField: React.FC<SearchFieldProps> = ({
  onSearch,
  searchFieldClass,
  placeholder = DICTIONARY.placeholders.search,
}) => {
  const [searchKey, setSearchKey] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const key = e.target.value;
    setSearchKey(key);
    debouncedFunc(onSearch, key);
  };

  return (
    <div className={classnames(styles.searchWrapper, searchFieldClass)}>
      <div className={styles.search}>
        <SearchIcon />
        <input
          value={searchKey}
          placeholder={placeholder}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>
      {searchKey && (
        <Button
          type={ButtonTypes.icon}
          onClick={() => {
            setSearchKey('');
            onSearch('');
          }}
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  );
};
