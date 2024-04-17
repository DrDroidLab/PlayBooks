import SelectComponent from '../../SelectComponent';
import styles from '../playbooks.module.css';
import { useDispatch } from 'react-redux';
import { CircularProgress } from '@mui/material';
import PlaygroundStep from './PlaygroundStep.jsx';
import {
  useGetPlaygroundConnectorTypesQuery,
  useLazyGetPlaygroundAssetModelOptionsQuery
} from '../../../store/features/playground/api/index.ts';
import { selectSourceAndModel } from '../../../store/features/playground/playgroundSlice.ts';

function Query({ step, index }) {
  const { data: connectorData, isFetching: connectorLoading } =
    useGetPlaygroundConnectorTypesQuery();
  const [triggerGetAssetModelOptions, { isFetching }] =
    useLazyGetPlaygroundAssetModelOptionsQuery();
  const dispatch = useDispatch();

  function handleSourceChange(key, val) {
    dispatch(
      selectSourceAndModel({
        index,
        source: val.connector_type,
        modelType: val.model_type,
        key
      })
    );
    triggerGetAssetModelOptions({
      connector_type: val.connector_type,
      model_type: val.model_type,
      stepIndex: index
    });
  }

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
            disabled={true}
          />
        </div>
      </div>

      {step.source && <PlaygroundStep card={step} index={index} assetsList={step.assets} />}
    </div>
  );
}

export default Query;
