import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import styles from './index.module.css';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
const InsightOptions = ({
  alertTypes,
  activeChannels,
  selectedActiveChannels,
  selectedAlertTypes,
  onActiveChannel,
  onAlertType,
  showAlertTypes = true
}) => {
  return (
    <>
      <div className={styles['autocomplete']}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          options={activeChannels}
          getOptionLabel={option => option.label}
          value={selectedActiveChannels}
          renderOption={(props, option, { selected }) => {
            const ids = selectedActiveChannels.map(alertType => alertType.id);
            if (ids.includes(option.id)) {
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
                {option.label}
              </li>
            );
          }}
          renderInput={params => (
            <TextField {...params} variant="standard" placeholder="Active Channels" />
          )}
          onChange={onActiveChannel}
        />
      </div>
      {showAlertTypes && (
        <div className={styles['autocomplete']}>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={alertTypes}
            getOptionLabel={option => option.label}
            value={selectedAlertTypes}
            renderOption={(props, option, { selected }) => {
              const ids = selectedAlertTypes.map(alertType => alertType.id);
              if (ids.includes(option.id)) {
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
                  {option.label}
                </li>
              );
            }}
            renderInput={params => (
              <TextField {...params} variant="standard" placeholder="Alert Types" />
            )}
            onChange={onAlertType}
          />
        </div>
      )}
    </>
  );
};

export default InsightOptions;
