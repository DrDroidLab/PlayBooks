import React, { useState } from 'react';
import styles from './styles.module.css';
// import ValueComponent from '../ValueComponent';
import { useDispatch, useSelector } from 'react-redux';
import Overlay from '../../Overlay/index.jsx';
import {
  addGlobalVariable,
  playbookSelector
} from '../../../store/features/playbook/playbookSlice.ts';
import { Close } from '@mui/icons-material';
import ValueComponent from '../../ValueComponent/index.jsx';
import Toast from '../../Toast.js';

const AddVariableOverlay = ({ isOpen, close }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const dispatch = useDispatch();
  const { globalVariables } = useSelector(playbookSelector);

  const resetState = () => {
    setName('');
    setValue('');
    setValidationError('');
  };

  const handleSubmit = () => {
    if (!(name && value)) {
      setValidationError('Please enter all fields');
      return;
    }
    const nameVal = !name.startsWith('$') ? `$${name}` : name;
    if (globalVariables?.find(e => e.name === nameVal)) {
      setValidationError('A variable with this name already exists');
      return;
    }
    dispatch(addGlobalVariable({ name: nameVal, value: value }));
    close();
    resetState();
  };

  return (
    <div style={{ zIndex: '200' }}>
      <Overlay visible={isOpen}>
        <div className={styles['dashboardSaveOverlay']}>
          <div className={styles['dashboardSaveOverlay__content']}>
            <div className={styles.title}>
              Add a new variable
              <Close onClick={() => close()} />
            </div>
          </div>
          <div className={styles.variable}>
            <ValueComponent
              valueType={'STRING'}
              onValueChange={val => setName(val)}
              value={name}
              placeHolder={'Enter variable name'}
              length={100}
            />
            <ValueComponent
              valueType={'STRING'}
              onValueChange={val => setValue(val)}
              value={value}
              placeHolder={'Enter variable value'}
              length={100}
            />
          </div>
          <div className={styles['actions']}>
            <button className={styles['submitButton']} onClick={() => close()}>
              Cancel
            </button>

            <button
              className={styles['submitButton']}
              onClick={handleSubmit}
              style={{
                marginLeft: '12px'
              }}
            >
              Add
            </button>
          </div>
        </div>
        <Toast
          open={validationError}
          severity="error"
          message={validationError}
          handleClose={() => setValidationError('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        />
      </Overlay>
    </div>
  );
};

export default AddVariableOverlay;
