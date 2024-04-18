import React from 'react';
import RadioComponent from '../RadioComponent';
import styles from './index.module.css';
import cx from 'classnames';
import { randomString } from '../../utils/utils';

const RadioGroupComponent = ({
  label,
  options,
  onChange,
  orientation = 'horizontal',
  checked,
  groupName = randomString()
}) => {
  const renderOptions = () => {
    return options.map(({ label, name, disabled, value = label, defaultChecked }, index) => {
      let checkedValue = false;
      const shortenedOptionLabel = label.replace(/\s+/g, '');
      const optionId = `radio-option-${shortenedOptionLabel}`;
      if (checked === value) checkedValue = true;
      return (
        <RadioComponent
          value={value}
          label={label}
          key={optionId}
          id={`${optionId}-${groupName}`}
          name={groupName}
          disabled={disabled}
          defaultChecked={checkedValue}
          onChange={onChange}
        />
      );
    });
  };

  return (
    <div className={cx(styles['container'])}>
      {label && <div className={styles['label']}>{label}</div>}
      <div
        className={cx({
          [styles['horizontal']]: orientation === 'horizontal',
          [styles['vertical']]: orientation === 'vertical'
        })}
      >
        {renderOptions()}
      </div>
    </div>
  );
};

export default RadioGroupComponent;
