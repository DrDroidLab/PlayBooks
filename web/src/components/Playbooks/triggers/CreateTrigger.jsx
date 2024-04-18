/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import Heading from '../../Heading';
import { useDispatch, useSelector } from 'react-redux';
import { playbookSelector } from '../../../store/features/playbook/playbookSlice.ts';
import styles from './index.module.css';
import { useLazyGetPlaybookQuery } from '../../../store/features/playbook/api/index.ts';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import ValueComponent from '../../ValueComponent/index.jsx';
import AlertsTable from './AlertsTable.jsx';
import {
  useCreateTriggerMutation,
  useGetTriggerOptionsQuery,
  useLazyGetTriggerQuery
} from '../../../store/features/triggers/api/index.ts';
import SelectComponent from '../../SelectComponent';
import {
  resetTriggerState,
  setChannel,
  setFilterString,
  setSource,
  triggerSelector
} from '../../../store/features/triggers/triggerSlice.ts';
import { useLazyGetSearchTriggersQuery } from '../../../store/features/triggers/api/searchTriggerApi.ts';
import TriggerOverlay from './TriggerOverlay.jsx';

function CreateTrigger() {
  const navigate = useNavigate();
  const { playbook_id, triggerId } = useParams();
  const dispatch = useDispatch();
  const { currentPlaybook } = useSelector(playbookSelector);
  const [triggerGetPlaybook, { isFetching }] = useLazyGetPlaybookQuery();
  const { data: options } = useGetTriggerOptionsQuery();
  const { workspaceId, channel, source, filterString, isPrefetched } = useSelector(triggerSelector);
  const [triggerSearchTrigger, { data: searchTriggerResult, isFetching: searchLoading }] =
    useLazyGetSearchTriggersQuery();
  const [createTrigger, { isLoading: saveLoading, isSuccess, data: triggerData }] =
    useCreateTriggerMutation();
  const [getTrigger, { isFetching: triggerLoading }] = useLazyGetTriggerQuery();
  const [isTriggerOverlayOpen, setIsTriggerOverlayOpen] = useState(false);

  const sources = options?.alert_types?.filter(e => e.channel_connector_key_id === channel?.id);
  const data = searchTriggerResult?.alerts ?? null;

  useEffect(() => {
    if (!currentPlaybook.name && playbook_id) {
      triggerGetPlaybook({ playbookId: playbook_id });
    }
  }, [playbook_id]);

  useEffect(() => {
    if (triggerId) {
      getTrigger(triggerId);
    }
  }, [triggerId]);

  useEffect(() => {
    if (isPrefetched) {
      handleSubmit();
    }
  }, [isPrefetched]);

  useEffect(() => {
    return () => {
      dispatch(resetTriggerState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      if (triggerData?.alert_ops_triggers?.length > 0)
        navigate(`/playbooks/triggers/view/${playbook_id}/${triggerData.alert_ops_triggers[0].id}`);
    }
  }, [isSuccess]);

  const handleSubmit = e => {
    e?.preventDefault();
    triggerSearchTrigger({
      workspaceId: workspaceId,
      channel_id: channel?.channel_id,
      alert_type: source?.alert_type,
      filter_string: filterString
    });
  };

  const handleChannelChange = (_, val) => {
    dispatch(setChannel(val.channel));
  };

  const handleSourceChange = (_, val) => {
    dispatch(setSource(val.source));
  };

  const handleSave = () => {
    createTrigger({
      playbook_id,
      workspaceId,
      channel,
      alert_type: source?.alert_type,
      filterString
    });
  };

  const saveCallback = () => {
    handleSave();
  };

  if (isFetching || triggerLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress />;
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Heading
        heading={'Add Trigger for Playbook - ' + currentPlaybook?.name}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />

      <div className={styles['step-cards-pane']}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 items-start my-2">
          <div className="text-sm flex items-center gap-2">
            <p>Channel</p>
            <SelectComponent
              disabled={isPrefetched}
              data={options?.active_channels?.map(e => {
                return {
                  id: e.channel_id,
                  label: e.channel_name,
                  channel: e
                };
              })}
              placeholder="Select Channel"
              onSelectionChange={handleChannelChange}
              selected={channel?.channel_id ?? ''}
              searchable={true}
            />
          </div>
          <div className="text-sm flex items-center gap-2">
            <p>Source</p>
            <SelectComponent
              disabled={isPrefetched}
              data={sources?.map(e => {
                return {
                  id: e.alert_type,
                  label: e.alert_type,
                  source: e
                };
              })}
              placeholder="Select Source"
              onSelectionChange={handleSourceChange}
              selected={source?.alert_type ?? ''}
              searchable={true}
            />
          </div>
          <div className="text-sm flex items-center gap-2">
            <p>Filter</p>
            <ValueComponent
              disabled={isPrefetched}
              valueType={'STRING'}
              onValueChange={val => {
                dispatch(setFilterString(val));
              }}
              value={filterString}
              placeHolder={'Enter filter string'}
              length={300}
            />
          </div>

          {!isPrefetched && (
            <button className={styles['pb-button']} style={{ marginLeft: 0 }}>
              Search
            </button>
          )}
        </form>
      </div>

      {searchLoading ? (
        <CircularProgress size={20} style={{ marginLeft: '10px' }} />
      ) : data ? (
        <>
          <div className={styles['step-cards-pane']}>
            <AlertsTable data={data} />
          </div>
          {!isPrefetched && (
            <>
              <div className="flex items-center" style={{ marginLeft: '10px' }}>
                {saveLoading && <CircularProgress size={20} />}
                <button
                  onClick={() => setIsTriggerOverlayOpen(true)}
                  className={styles['pb-button']}
                  disabled={saveLoading}
                >
                  Save
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <></>
      )}

      <TriggerOverlay
        isOpen={isTriggerOverlayOpen}
        numberOfAlerts={searchTriggerResult?.total}
        close={() => setIsTriggerOverlayOpen(false)}
        saveCallback={saveCallback}
      />
    </div>
  );
}

export default CreateTrigger;
