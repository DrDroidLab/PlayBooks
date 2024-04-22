/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useRef, useState, useEffect } from "react";
import styles from "../SelectComponent/index.module.css";
import useToggle from "../../hooks/useToggle";
import cx from "classnames";
import useOutsideClick from "../../hooks/useOutsideClick";
import CheckboxGroupComponent from "../CheckboxGroupComponent";

const MultiSelectComponent = ({
  data,
  placeholder = "Select options",
  disabled,
  searchable,
  onSelectionChange,
  selectedValues,
  containerClassName = {},
}) => {
  const selectedRef = useRef(null);
  const [searchVal, setSearchVal] = useState("");
  const [options, setOptions] = useState(data);
  // const [selectedValues, setSelectedValues] = useState([]);

  const _containerClassName = cx(
    styles["_dropdown__container"],
    containerClassName,
  );
  const { isOpen, toggle } = useToggle();
  const toggleDropdown = () => toggle();

  const handleSelectionChange = (selectedIds) => {
    onSelectionChange(selectedIds);
  };

  const disableCheckboxClick = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (data !== options) setOptions(data);
  }, [data]);

  const getSelectedValues = useMemo(() => {
    return selectedValues
      ?.map((val) => data.find((item) => item.id === val)?.label)
      .join(", ");
  }, [selectedValues, data]);

  const handleSearchChange = (event) => {
    const searchedVal = event.target.value;
    const values = data.filter((item) =>
      item.label.toLowerCase().includes(searchedVal.toLowerCase()),
    );
    setSearchVal(searchedVal);
    setOptions(values);
  };

  useOutsideClick(selectedRef, () => toggle(false));
  return (
    <div className={_containerClassName} ref={selectedRef}>
      <div className={styles["dropdown__header"]} onClick={toggleDropdown}>
        <span>
          {selectedValues.length > 0 ? getSelectedValues : placeholder}
        </span>
        {!disabled && (
          <img
            width="20px"
            height="20px"
            src={"/icons/arrow-down.svg"}
            className={cx(styles["arrow-down-icon"], {
              [styles["open"]]: isOpen,
            })}
            alt="arrow-down"
          />
        )}
      </div>

      {!disabled && (
        <div
          className={cx(styles[`dropdown__body`], {
            [styles["open"]]: isOpen,
          })}
          onClick={disableCheckboxClick}>
          {!!searchable && (
            <input
              className={styles["searchContainer"]}
              onChange={handleSearchChange}
              value={searchVal}
              type={"text"}
            />
          )}
          <CheckboxGroupComponent
            itemClassName={styles["dropdown__item"]}
            orientation="vertical"
            options={options}
            checkedIds={selectedValues}
            onChange={handleSelectionChange}
          />
        </div>
      )}
    </div>
  );
};

export default MultiSelectComponent;
