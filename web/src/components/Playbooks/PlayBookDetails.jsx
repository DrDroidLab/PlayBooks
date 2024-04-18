import { useParams } from 'react-router-dom';
import API from '../../API';
import { useEffect, useState } from 'react';

import SuspenseLoader from '../Skeleton/SuspenseLoader';
import TableSkeleton from '../Skeleton/TableLoader';
import CreatePlaybook from './CreatePlaybook';
import { useDispatch } from 'react-redux';
import { setPlaybookData } from '../../store/features/playbook/playbookSlice.ts';

const PlayBookDetails = () => {
  const { playbook_id } = useParams();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const [playbook, setPlaybook] = useState({});

  const getPlaybooksData = API.useGetPlaybooksData();

  useEffect(() => {
    if (playbook_id) {
      getPlaybooksData(
        { playbook_ids: [parseInt(playbook_id)] },
        response => {
          if (response.data?.playbooks?.length > 0) {
            setPlaybook(response.data.playbooks[0]);
            dispatch(setPlaybookData(response.data.playbooks[0]));
          }
          setLoading(false);
        },
        err => {
          setLoading(false);
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbook_id]);

  return (
    <div>
      <SuspenseLoader loading={!!loading} loader={<TableSkeleton />}>
        <CreatePlaybook playbook={playbook} allowSave={false} />
      </SuspenseLoader>
    </div>
  );
};

export default PlayBookDetails;
