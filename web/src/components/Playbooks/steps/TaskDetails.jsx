/* eslint-disable react-hooks/exhaustive-deps */
import SelectComponent from '../../SelectComponent/index.jsx';
import styles from './index.module.css';
import { CircularProgress } from '@mui/material';
import { useLazyGetAssetsQuery } from '../../../store/features/playbook/api/index.ts';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  setErrors,
  setSelectedGrafanaOptions,
  updateStep
} from '../../../store/features/playbook/playbookSlice.ts';
import ValueComponent from '../../ValueComponent/index.jsx';

function TaskDetails({ task, data, stepIndex }) {
  const [triggerGetAssets, { isFetching }] = useLazyGetAssetsQuery();
  const dispatch = useDispatch();
  const prevError = useRef(null);

  const getAssets = () => {
    triggerGetAssets({
      filter: data.assetFilterQuery,
      stepIndex
    });
  };

  const setDefaultErrors = () => {
    const errors = {};
    for (let step of data.builder) {
      for (let value of step) {
        if (!value.key || value.selected) {
          break;
        }
        errors[value.key] = {
          message: 'Please enter a value'
        };
      }
    }

    prevError.current = errors;
    dispatch(setErrors({ index: stepIndex, errors }));
  };

  const removeErrors = key => {
    const errors = structuredClone(task.errors ?? {});
    delete errors[key];

    prevError.current = errors;
    dispatch(setErrors({ index: stepIndex, errors }));
  };

  useEffect(() => {
    if (task[data.triggerGetAssetsKey]) {
      getAssets();
    }
  }, [task[data?.triggerGetAssetsKey]]);

  useEffect(() => {
    const errorChanged = prevError.current === task.errors;
    if (
      !task.isPrefetched &&
      task &&
      data.builder &&
      Object.keys(task?.errors ?? {}).length === 0 &&
      !errorChanged
    ) {
      setDefaultErrors();
    }
  }, [task]);

  function handleOption(data) {
    const handleChange = (...args) => {
      if (data.handleChange) {
        data.handleChange(...args);
      } else {
        dispatch(updateStep({ index: stepIndex, key: data.key, value: args[0] }));
      }

      removeErrors(data.key);
    };

    const handleTextAreaChange = e => {
      const val = e.target.value;
      if (data.handleChange) {
        data.handleChange(e);
      } else {
        dispatch(updateStep({ index: stepIndex, key: data.key, value: val }));
      }

      removeErrors(data.key);
    };

    const error = data.key ? task.showError && !data.selected && !task[`${data.key}`] : false;

    switch (data.type) {
      case 'options':
        if (!(data.options?.length > 0)) return;
        return (
          <SelectComponent
            key={data.key}
            data={data.options}
            placeholder={`Select ${data.label}`}
            onSelectionChange={handleChange}
            selected={data.selected ?? task[`${data.key}`]}
            searchable={true}
            disabled={data.disabled}
            error={error}
          />
        );
      case 'text':
        return (
          <div className="flex flex-col">
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#676666' }}>
              <b>{data.label}</b>
            </p>
            <ValueComponent
              key={data.key}
              placeHolder={`Enter ${data?.label}`}
              valueType={'STRING'}
              onValueChange={handleChange}
              value={data.selected || task[`${data.key}`]}
              error={error}
            />
          </div>
        );
      case 'multiline':
        return (
          <div key={data.key} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#676666' }}>
              <b>{data.label}</b>
            </p>
            <textarea
              className={styles['notes']}
              rows={4}
              value={data.value ?? task[`${data.key}`]}
              onChange={handleTextAreaChange}
              disabled={data.disabled}
              style={error ? { borderColor: 'red' } : {}}
            />
          </div>
        );
      default:
        return;
    }
  }

  const handleVariableChange = (_, val) => {
    dispatch(setSelectedGrafanaOptions({ index: stepIndex, option: val }));
  };

  return (
    <>
      {data?.builder?.map((step, index) => (
        <div
          key={index}
          style={{ display: 'flex', marginTop: '5px', gap: '5px', alignItems: 'center' }}
        >
          {step.map(value => {
            let flag = true;
            for (let val of value?.requires ?? []) {
              if (!task[val]) {
                flag = false;
                break;
              }
            }

            if (flag) return handleOption(value);
            else return <></>;
          })}
          {isFetching && <CircularProgress size={20} />}
        </div>
      ))}
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
                      selected={
                        task?.selectedOptions ? task?.selectedOptions[option?.variable] : ''
                      }
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
    </>
  );
}

export default TaskDetails;
