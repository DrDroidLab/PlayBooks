import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import SuspenseLoader from '../Skeleton/SuspenseLoader.js';
import TableSkeleton from '../Skeleton/TableLoader.js';
import CreatePlaybook from './CreatePlaybook.jsx';
import { useDispatch } from 'react-redux';
import { useLazyGetPlaybookQuery } from '../../store/features/playbook/api/index.ts';
import { setPlaybookEditing } from '../../store/features/playbook/playbookSlice.ts';
import Loading from '../common/Loading/index.tsx';

const EditPlaybook = () => {
  const { playbook_id } = useParams();
  const dispatch = useDispatch();
  const [triggerGetPlaybook, { isLoading, data: playbook }] = useLazyGetPlaybookQuery();

  const fetchPlaybook = async () => {
    const res = await triggerGetPlaybook({ playbookId: playbook_id }).unwrap();
    dispatch(setPlaybookEditing(res));
  };

  useEffect(() => {
    if (playbook_id) {
      fetchPlaybook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbook_id]);

  if (isLoading) {
    return <Loading title="Your Playbook is loading..." />;
  }

  return (
    <div>
      <SuspenseLoader loading={isLoading} loader={<TableSkeleton />}>
        <CreatePlaybook playbook={playbook} allowSave={false} />
      </SuspenseLoader>
    </div>
  );
};

export default EditPlaybook;
