/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import Heading from "../../../components/Heading";

import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";

import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import { useNavigate } from "react-router-dom";
import { Toast } from "../../../components/Toast.jsx";
import useToggle from "../../../hooks/useToggle";

import styles from "../../../css/createMonitor.module.css";
import {
  useGetGoogleSpacesListQuery,
  useRegisterGoogleSpacesMutation,
} from "../../../store/features/integrations/api/index.ts";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const GoogleChatIntegration = () => {
  const [selectedGSpaces, setSelectedGSpaces] = useState([]);
  const { isOpen, toggle } = useToggle();
  const { isOpen: IsError, toggle: toggleError } = useToggle();
  const { data } = useGetGoogleSpacesListQuery();
  const [triggerRegisterGoogleSpaces] = useRegisterGoogleSpacesMutation();

  const navigate = useNavigate();

  const onGSpaceSelectionChange = (event, selectedOptions, reason) => {
    if (reason === "selectOption") {
      const counts = {};
      let filtered;
      const ids = selectedOptions.map(({ name }) => name);
      ids.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
      });
      const duplicateId = Object.entries(counts).filter(
        ([key, value]) => value > 1,
      )[0];
      if (duplicateId) {
        filtered = selectedOptions.filter(
          ({ name }, index) => name !== duplicateId[0],
        );
      } else {
        filtered = selectedOptions;
      }
      setSelectedGSpaces(filtered);
      return;
    }
    setSelectedGSpaces(selectedOptions);
  };

  const handleSave = async () => {
    try {
      const data = await triggerRegisterGoogleSpaces({
        spaces: selectedGSpaces,
      }).unwrap();
      if (data.success) {
        navigate("/integrations");
      }
    } catch (e) {
      console.log("Error:", e);
    }
  };

  return (
    <>
      <Heading
        heading={"Google Chat Integration Setup"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />

      {data?.registered_spaces && data?.registered_spaces?.length > 0 && (
        <>
          <div className={styles["container"]}>
            <div className={styles["heading"]}>Registered Google Spaces</div>
            <div className={styles["eventTypeSelectionSection"]}>
              {data?.registered_spaces?.map((space) => (
                <span
                  style={{
                    margin: "5px 5px 5px 5px",
                    padding: "5px",
                    borderRadius: "10px",
                    backgroundColor: "#be95fe",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}>
                  {space.display_name ? space.display_name : space.name}
                </span>
              ))}
            </div>
          </div>
          <hr></hr>
        </>
      )}

      <div className={styles["container"]}>
        <div className={styles["heading"]}>Add Google Spaces to integrate </div>
        <div className={styles["eventTypeSelectionSection"]}>
          <div style={{ fontSize: "13px", width: "150px", margin: "auto" }}>
            Available Spaces
          </div>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={data?.spaces ?? []}
            getOptionLabel={(option) =>
              option.display_name ? option.display_name : option.name
            }
            value={selectedGSpaces}
            style={{ width: "100%" }}
            renderOption={(props, option, { selected }) => {
              const ids = selectedGSpaces.map((op) => op.name);
              if (ids.includes(option.name)) {
                selected = true;
              }
              return (
                <li {...props}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.display_name ? option.display_name : option.name}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                placeholder="Select Spaces"
              />
            )}
            onChange={onGSpaceSelectionChange}
          />
        </div>
      </div>
      <button
        className="text-xs bg-white hover:bg-violet-500 hover:color-white-500 py-1 px-1 border border-gray-400 rounded shadow"
        onClick={handleSave}
        style={{
          marginLeft: "12px",
          marginBottom: "12px",
        }}>
        Save
      </button>
      <Toast
        open={!!isOpen}
        severity="info"
        handleClose={() => toggle()}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
      <Toast
        open={!!IsError}
        severity="error"
        handleClose={() => toggleError()}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </>
  );
};

export default GoogleChatIntegration;
