/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import SelectComponent from '../../SelectComponent';
import PlaybookStep from './PlaybookStep';
import styles from '../playbooks.module.css';
import {
  useGetConnectorTypesQuery,
  useLazyGetAssetModelOptionsQuery
} from '../../../store/features/playbook/api/index.ts';
import { selectSourceAndModel } from '../../../store/features/playbook/playbookSlice.ts';
import { useDispatch } from 'react-redux';
import { CircularProgress } from '@mui/material';

function Query({ step, index }) {
  const { data: connectorData, isFetching: connectorLoading } = useGetConnectorTypesQuery();
  const [triggerGetAssetModelOptions, { isFetching }] = useLazyGetAssetModelOptionsQuery();
  const dispatch = useDispatch();

  const fetchData = val => {
    triggerGetAssetModelOptions({
      connector_type: val?.connector_type || step.source,
      model_type: val?.model_type || step.modelType,
      stepIndex: index
    });
  };

  function handleSourceChange(key, val) {
    dispatch(
      selectSourceAndModel({
        index,
        source: val.connector_type,
        modelType: val.model_type,
        key
      })
    );

    fetchData(val);
  }

  useEffect(() => {
    if (step.isPrefetched) {
      fetchData();
    }
  }, [step.isPrefetched]);

  return (
    <div className={styles['step-fields']}>
      <div
        style={{
          display: 'flex',
          marginTop: '5px',
          position: 'relative'
        }}
      >
        <div className="flex items-center">
          {(isFetching || connectorLoading) && (
            <CircularProgress
              style={{
                marginRight: '12px'
              }}
              size={20}
            />
          )}
          <SelectComponent
            data={connectorData}
            placeholder="Select Data Source"
            onSelectionChange={(key, value) => handleSourceChange(key, value)}
            selected={step.selectedSource}
            searchable={true}
            disabled={step.isPrefetched && !step.isCopied && step.source}
          />
        </div>
      </div>

      {step.source && <PlaybookStep card={step} index={index} assetsList={step.assets} />}
    </div>
  );
}

export default Query;
