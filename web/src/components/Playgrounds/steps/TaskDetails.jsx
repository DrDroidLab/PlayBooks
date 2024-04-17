/* eslint-disable react-hooks/exhaustive-deps */
import SelectComponent from '../../SelectComponent/index.jsx';
import styles from './index.module.css';
import { CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import ValueComponent from '../../ValueComponent/index.jsx';
import { useLazyGetPlaygroundAssetsQuery } from '../../../store/features/playground/api/index.ts';

function TaskDetails({ task, data, stepIndex }) {
  const [triggerGetAssets, { isFetching }] = useLazyGetPlaygroundAssetsQuery();

  const getAssets = () => {
    triggerGetAssets({
      filter: data.assetFilterQuery,
      stepIndex
    });
  };

  useEffect(() => {
    if (task[data.triggerGetAssetsKey]) {
      getAssets();
    }
  }, [task[data?.triggerGetAssetsKey]]);

  function handleOption(data) {
    switch (data.type) {
      case 'options':
        if (!(data.options?.length > 0)) return;
        return (
          <SelectComponent
            data={data.options}
            placeholder={`Select ${data.label}`}
            selected={data.selected ?? task[`${data.key}`]}
            searchable={true}
            disabled={true}
          />
        );
      case 'text':
        return (
          <div className="flex flex-col">
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#676666' }}>
              <b>{data.label}</b>
            </p>
            <input
              className={styles['notes']}
              rows={4}
              value={data.selected}
              onChange={data.handleChange}
              disabled={true}
            />
          </div>
        );
      case 'multiline':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#676666' }}>
              <b>{data.label}</b>
            </p>
            <textarea
              className={styles['notes']}
              rows={4}
              value={data.value ?? task[`${data.key}`]}
              disabled={true}
            />
          </div>
        );
      default:
        return;
    }
  }

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
                      disabled={true}
                      selected={
                        task?.selectedOptions ? task?.selectedOptions[option?.variable] : ''
                      }
                      searchable={true}
                    />
                  ) : (
                    <ValueComponent
                      placeHolder={`Enter ${option?.variable}`}
                      valueType={'STRING'}
                      disabled={true}
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
