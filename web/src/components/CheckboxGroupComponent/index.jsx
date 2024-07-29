import React from "react";
import CheckboxComponent from "../CheckboxComponent";
import styles from "./index.module.css";
import cx from "classnames";
import { randomString } from "../../utils/common/randomString";

const CheckboxGroupComponent = ({
  itemClassName,
  label,
  options,
  onChange,
  orientation = "horizontal",
  checkedIds = [],
  groupName = randomString(),
}) => {
  const _itemClassName = cx(styles.itemContainer, itemClassName);
  const renderOptions = () => {
    const handleChange = (event) => {
      const selectedId = event.target.value;
      let selectedCheckedIds;
      if (checkedIds.includes(selectedId)) {
        selectedCheckedIds = checkedIds.filter((id) => id !== selectedId);
      } else {
        selectedCheckedIds = [...checkedIds, selectedId];
      }
      onChange(selectedCheckedIds);
    };
    return options.map(
      (
        { label, name = "checkbox", disabled, id = label, defaultChecked },
        index,
      ) => {
        let checked = false;
        if (checkedIds.includes(id)) checked = true;
        const shortenedOptionLabel = label?.replace(/\s+/g, "");
        const optionId = `checkbox-option-${shortenedOptionLabel}`;
        return (
          <CheckboxComponent
            value={id}
            label={label}
            key={optionId}
            id={`${optionId}-${groupName}`}
            name={`${name}-${groupName}`}
            checked={checked}
            disabled={disabled}
            defaultChecked={defaultChecked}
            onChange={handleChange}
            containerClassName={_itemClassName}
          />
        );
      },
    );
  };

  return (
    <div className={cx(styles["container"])}>
      {label && <div className={styles["label"]}>{label}</div>}
      <div
        className={cx({
          [styles["horizontal"]]: orientation === "horizontal",
          [styles["vertical"]]: orientation === "vertical",
        })}>
        {renderOptions()}
      </div>
    </div>
  );
};

export default CheckboxGroupComponent;
