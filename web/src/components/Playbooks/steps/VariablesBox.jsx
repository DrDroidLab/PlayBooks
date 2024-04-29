import React from 'react';
import SelectComponent from '../../SelectComponent';
import styles from './index.module.css';
import { useDispatch } from 'react-redux';
import { setSelectedGrafanaOptions } from '../../../store/features/playbook/playbookSlice.ts';
import ValueComponent from '../../ValueComponent';

function VariablesBox({ task, stepIndex }) {
  const dispatch = useDispatch();
  const handleVariableChange = (_, val) => {
    dispatch(setSelectedGrafanaOptions({ index: stepIndex, option: val }));
  };

  return (
    <div className={styles['variables-box']}>
      {task?.options && task?.options?.length > 0 && (
        <div style={{ display: 'flex', gap: '5px', flexDirection: 'row' }}>
          <p style={{ fontSize: '12px', color: 'darkgray', marginTop: '5px' }}>Variables</p>
          {task?.options.map((option, i) => {
            return (
              <div key={stepIndex} style={{ display: 'flex', gap: '5px' }}>
                {option?.values?.length > 0 ? (
                  <SelectComponent
                    data={option?.values.map((e, i) => {
                      return {
                        id: e,
                        label: e,
                        option
                      };
                    })}
                    placeholder={`Select ${option?.label?.label}`}
                    onSelectionChange={handleVariableChange}
                    selected={task?.selectedOptions ? task?.selectedOptions[option?.variable] : ''}
                    searchable={true}
                  />
                ) : (
                  <ValueComponent
                    placeHolder={`Enter ${option?.variable}`}
                    valueType={'STRING'}
                    onValueChange={val =>
                      handleVariableChange({
                        id: val,
                        label: option.variable
                      })
                    }
                    value={task?.selectedOptions ? task?.selectedOptions[option?.variable] : ''}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VariablesBox;
