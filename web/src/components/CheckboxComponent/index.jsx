import React from 'react';
import styles from './index.module.css';
import cx from 'classnames';

const CheckboxComponent = ({
  containerClassName,
  label,
  disabled = false,
  defaultChecked = false,
  checked,
  onChange,
  value,
  name,
  id = 'checkbox',
  ...rest
}) => {
  const _containerClassName = cx(styles['_container'], containerClassName);
  return (
    <div className={_containerClassName}>
      <input
        type="checkbox"
        className={styles['_input']}
        id={id}
        onChange={onChange}
        value={value}
        name={name}
        disabled={disabled}
        checked={checked}
        {...rest}
      />
      <label disabled={disabled} className={styles['_label']} htmlFor={id}>
        {label}
      </label>
    </div>
  );
};

export default CheckboxComponent;
