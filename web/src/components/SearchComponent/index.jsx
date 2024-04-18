import React, { useState } from 'react';
import styles from './index.module.css';
import SelectComponent from '../SelectComponent';

export const SearchComponent = ({
  options,
  onSearchChange,
  selectDisabled,
  selectPlaceholder,
  selectedType,
  inputPlaceholder
}) => {
  const [searchVal, setSearchVal] = useState('');
  const [selectedOption, setSelectedOption] = useState(selectedType || options[0].id);
  const handleSelectionChange = (id, item) => {
    setSearchVal('');
    setSelectedOption(id);
    onSearchChange('', id);
  };
  const handleChange = event => {
    setSearchVal(event.target.value);
    onSearchChange(event.target.value, selectedOption);
  };

  return (
    <div className={styles['container']}>
      <div className={styles['container__search']}>
        <SelectComponent
          data={options}
          selected={selectedOption}
          disabled={selectDisabled}
          onSelectionChange={handleSelectionChange}
          placeholder={selectPlaceholder}
          containerClassName={styles['container__search__select']}
        />
        <input
          type="text"
          placeholder={inputPlaceholder ? inputPlaceholder : 'Search...'}
          name="search"
          onChange={handleChange}
          value={searchVal}
          className={styles['container__search__input']}
          autoComplete="off"
        />
      </div>
    </div>
  );
};
