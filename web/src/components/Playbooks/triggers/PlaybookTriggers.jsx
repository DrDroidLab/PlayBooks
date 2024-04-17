import { useParams } from 'react-router-dom';
import Heading from '../../Heading.js';
import SuspenseLoader from '../../Skeleton/SuspenseLoader.js';
import TableSkeleton from '../../Skeleton/TableLoader.js';
import TriggersTable from './TriggersTable.jsx';
import styles from './index.module.css';
import { useSelector } from 'react-redux';
import { playbookSelector } from '../../../store/features/playbook/playbookSlice.ts';
import { useLazyGetPlaybookQuery } from '../../../store/features/playbook/api/index.ts';
import { useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { useLazyGetPlaybookTriggerQuery } from '../../../store/features/triggers/api/index.ts';

const PlaybookTriggers = () => {
  const { playbook_id } = useParams();
  const { currentPlaybook } = useSelector(playbookSelector);
  const [triggerGetPlaybook, { isFetching }] = useLazyGetPlaybookQuery();
  const [triggerGetTriggers, { isFetching: triggersLoading, data }] =
    useLazyGetPlaybookTriggerQuery();

  const total = 0;
  const pageMeta = { limit: 10, offset: 0 };

  const fetchData = () => {
    triggerGetTriggers(playbook_id);
  };

  useEffect(() => {
    if (!currentPlaybook.name && playbook_id) {
      triggerGetPlaybook({ playbookId: playbook_id });
    }
    if (currentPlaybook.name) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlaybook.name, playbook_id]);

  if (isFetching || triggersLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <Heading
        heading={'Triggers for Playbook - ' + currentPlaybook.name}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />
      <SuspenseLoader loading={false} loader={<TableSkeleton />}>
        <TriggersTable
          playbookList={data}
          total={total}
          pageSize={pageMeta ? pageMeta?.limit : 10}
          tableContainerStyles={10 ? {} : { maxHeight: '35vh', minHeight: '35vh' }}
          refreshTable={fetchData}
          showDelete={false}
        />
        <a href={`/playbooks/triggers/create/${playbook_id}`} className={styles['pb-button']}>
          Add Trigger
        </a>
      </SuspenseLoader>
    </div>
  );
};

export default PlaybookTriggers;
