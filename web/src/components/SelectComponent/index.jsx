/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import styles from "./index.module.css";
import useToggle from "../../hooks/useToggle";
import cx from "classnames";
import useOutsideClick from "../../hooks/useOutsideClick";
import { Tooltip } from "@mui/material";

function tr(str) {
  const N = 25;
  if (str && str.length > N) {
    return str.substring(0, N) + "...";
  }
  return str;
}

const SelectComponent = ({
  data,
  placeholder = "Select your id",
  onSelectionChange,
  selected,
  disabled = false,
  searchable = false,
  containerClassName = {},
  error,
}) => {
  const selectRef = useRef(null);
  const [searchVal, setSearchVal] = useState("");
  const [options, setOptions] = useState(data);
  const { isOpen, toggle } = useToggle();
  const toggleDropdown = () => toggle();
  const _containerClassName = cx(
    styles["_dropdown__container"],
    containerClassName,
  );

  function onKeyUp(e, item) {
    if (e.keyCode === 13) {
      if (e.target.id === "dropdown") {
        toggleDropdown();
      } else {
        handleItemClick(e.target.id, item);
      }
    }
  }

  useEffect(() => {
    if (data !== options) setOptions(data);
  }, [data]);

  const handleItemClick = (id, item) => {
    onSelectionChange(id, item);
    toggle();
  };

  const returnSubLabel = (data, selected) => {
    let selectedItem = data?.find((item) => item.id === selected);
    if (selectedItem && selectedItem.subLabel) {
      return `(${selectedItem.subLabel})`;
    }
    return "";
  };

  const handleSearchChange = (event) => {
    const searchedVal = event.target.value;
    const values = data.filter((item) =>
      item.label.toLowerCase().includes(searchedVal.toLowerCase()),
    );
    setSearchVal(searchedVal);
    setOptions(values);
  };

  useOutsideClick(selectRef, () => toggle(false));

  return (
    <div
      id="helo"
      className={_containerClassName}
      ref={selectRef}
      style={error ? { borderColor: "red" } : {}}>
      <div
        className={styles["dropdown__header"]}
        tabIndex={0}
        id="dropdown"
        onKeyUp={onKeyUp}
        onClick={toggleDropdown}>
        {selected ? (
          <>
            <Tooltip title={data?.find((item) => item.id === selected)?.label}>
              <>
                <span>
                  {tr(data?.find((item) => item.id === selected)?.label)}
                </span>{" "}
                &nbsp;
              </>
            </Tooltip>
            {returnSubLabel(data, selected)}{" "}
          </>
        ) : (
          <span>{placeholder}</span>
        )}
        {!disabled && (
          <img
            width="20px"
            height="20px"
            src={"/icons/arrow-down.svg"}
            className={cx(styles["arrow-down-icon"], {
              [styles["open"]]: isOpen,
            })}
            alt="drop down icon"
          />
        )}
      </div>

      {!disabled && (
        <div
          className={cx(styles[`dropdown__body`], {
            [styles["open"]]: isOpen,
          })}>
          {" "}
          {!!searchable && (
            <input
              className={styles["searchContainer"]}
              onChange={handleSearchChange}
              value={searchVal}
              type={"text"}
              tabIndex={0}
            />
          )}
          {options?.map((item, index) => (
            <div
              className={styles["dropdown__item"]}
              onClick={(e) => handleItemClick(e.target.id, item)}
              onKeyUp={(e) => onKeyUp(e, item)}
              id={item.id}
              tabIndex={0}
              key={item.id + index}>
              <span
                className={cx(styles[`dropdown__item-dot`], {
                  [styles["selected"]]: item.id === selected,
                })}></span>
              {item.label}&nbsp;
              {item.subLabel ? `(${item.subLabel})` : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectComponent;
