import React, { useMemo, useState } from 'react';
import styles from './index.module.css';
import RadioGroupComponent from '../RadioGroupComponent';
import SelectComponent from '../SelectComponent';
import CheckboxGroupComponent from '../CheckboxGroupComponent';
import CheckboxComponent from '../CheckboxComponent';
import MultiSelectComponent from '../MultiSelectComponent';

const InputValueType = {
  LONG: 'LONG',
  LONG_ARRAY: 'LONG_ARRAY',
  STRING: 'STRING',
  STRING_ARRAY: 'STRING_ARRAY',
  DOUBLE: 'DOUBLE',
  DOUBLE_ARRAY: 'DOUBLE_ARRAY'
};

const AttrValuesPlaceholder = {
  LONG: 'Please enter a number',
  LONG_ARRAY: 'Please enter number value/values(comma separated)',
  STRING: 'Please enter a string',
  STRING_ARRAY: 'Please enter string value/values(comma separated)',
  DOUBLE: 'Please enter a number',
  DOUBLE_ARRAY: 'Please enter float value/values'
};

const ValueComponent = ({
  valueType,
  valueOptions,
  onValueChange,
  value,
  length,
  placeHolder,
  isPassword = false,
  disabled = false,
  error = null
}) => {
  const [hideText, setHideText] = useState(isPassword);
  // let hideText = isPassword;

  const handleChange = event => {
    let newValue;
    switch (valueType) {
      case InputValueType.LONG:
        newValue = event.target.value.replace(new RegExp(/[^\d]/, 'ig'), '');
        break;
      case InputValueType.LONG_ARRAY: {
        const value = event.target.value.replace(new RegExp(/[^\d,]/, 'ig'), '');
        if (value.includes(',')) {
          newValue = value.split(',').map(item => item.trim());
          break;
        }
        newValue = Array(1).fill(value);
        break;
      }
      case InputValueType.DOUBLE:
        newValue = event.target.value.replace(new RegExp(/[^\d.]/, 'ig'), '');
        break;
      case InputValueType.DOUBLE_ARRAY: {
        const value = event.target.value.replace(new RegExp(/[^\d,.]/, 'ig'), '');
        if (value.includes(',')) {
          newValue = value.split(',').map(item => item.trim());
          break;
        }
        newValue = Array(1).fill(value);
        break;
      }
      case InputValueType.STRING_ARRAY: {
        const value = event.target.value.replace(new RegExp(/[*]/, 'ig'), '');
        if (value.includes(',')) {
          newValue = value.split(',').map(item => item.trim());
          break;
        }
        newValue = Array(1).fill(value);
        break;
      }
      default:
        newValue = event.target.value.replace(new RegExp(/[*]/, 'ig'), '');
    }
    onValueChange(newValue);
  };

  const elementPlaceHolder = placeHolder ? placeHolder : AttrValuesPlaceholder[valueType];

  let inputLengthClass = 'inputLength';

  if (length) {
    inputLengthClass = 'inputLength_' + length.toString();
  }

  const boolOptions = [
    {
      label: 'True',
      name: 'boolean',
      value: true
    },
    {
      label: 'False',
      name: 'boolean',
      value: false
    }
  ];

  const getBooleanVal = value => {
    if (value === 'true') return true;
    if (value === 'false') return false;
  };

  const handleCheckboxChange = id => {
    onValueChange(id);
  };

  const handleRadiobuttonChange = event => {
    const value = getBooleanVal(event?.target?.value);
    onValueChange(value);
  };

  const checkIdArrayForCheckbox = useMemo(() => {
    if (valueType === 'ID_ARRAY' && Array.isArray(valueOptions) && valueOptions.length === 2) {
      return true;
    }
    return false;
  }, [valueType, valueOptions]);

  const checkIdArrayForMultiSelect = useMemo(() => {
    if (valueType === 'ID_ARRAY' && Array.isArray(valueOptions) && valueOptions.length > 2) {
      return true;
    }
    return false;
  }, [valueType, valueOptions]);

  const checkForId = useMemo(() => {
    if (valueType === 'ID' && Array.isArray(valueOptions)) {
      return true;
    }
    return false;
  }, [valueType, valueOptions]);

  return (
    <div className={styles['valueContainer']} onClick={e => e.stopPropagation()}>
      {InputValueType.hasOwnProperty(valueType) && (
        <div style={{ display: 'flex' }}>
          <input
            className={styles['input__valueContainer'] + ' ' + styles[inputLengthClass]}
            onChange={handleChange}
            value={typeof value === 'object' ? value.join(',') : value}
            type={hideText ? 'password' : 'text'}
            placeholder={elementPlaceHolder}
            disabled={disabled}
            style={error ? { borderColor: 'red' } : {}}
          />
          {isPassword && (
            <CheckboxComponent
              label="Show"
              onChange={() => setHideText(!hideText)}
              value={hideText}
              style={{ marginLeft: '10px' }}
            />
          )}
        </div>
      )}
      {checkForId && (
        <SelectComponent
          data={valueOptions}
          searchable={true}
          onSelectionChange={handleCheckboxChange}
          selected={value}
          disabled={disabled}
        />
      )}
      {checkIdArrayForCheckbox && (
        <div className={styles['boolean__valueContainer']}>
          <CheckboxGroupComponent
            options={valueOptions}
            onChange={handleCheckboxChange}
            checkedIds={value}
          />
        </div>
      )}
      {checkIdArrayForMultiSelect && (
        <MultiSelectComponent
          data={valueOptions}
          searchable={true}
          onSelectionChange={handleCheckboxChange}
          selectedValues={value || []}
          disabled={disabled}
        />
      )}
      {valueType === 'BOOLEAN' && (
        <div className={styles['boolean__valueContainer']}>
          <RadioGroupComponent
            onChange={handleRadiobuttonChange}
            options={boolOptions}
            checked={value}
          />
        </div>
      )}
      {['NULL_NUMBER', 'NULL_STRING'].includes(valueType) && <></>}
    </div>
  );
};

export default ValueComponent;
