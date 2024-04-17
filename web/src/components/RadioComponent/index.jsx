import React from 'react';
import styles from './index.module.css';

const RadioComponent = ({
  label,
  disabled = false,
  defaultChecked,
  onChange,
  value,
  name,
  id,
  ...rest
}) => {
  return (
    <div className={styles['container']}>
      <input
        disabled={disabled}
        type="radio"
        id={id}
        onChange={onChange}
        value={value}
        name={name}
        defaultChecked={defaultChecked}
        {...rest}
      />
      <label disabled={disabled} htmlFor={id}>
        <span>{label}</span>
      </label>
    </div>
  );
};

export default RadioComponent;
