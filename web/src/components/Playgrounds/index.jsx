import Heading from '../Heading.js';
import SuspenseLoader from '../Skeleton/SuspenseLoader.js';
import TableSkeleton from '../Skeleton/TableLoader.js';
import { useGetPlaygroundsQuery } from '../../store/features/playground/api/index.ts';
import PlaygroundTable from './PlaygroundTable.jsx';

const Playground = () => {
  const { data: playbookList, isLoading, refetch } = useGetPlaygroundsQuery();

  const total = 0;
  const pageMeta = { limit: 10, offset: 0 };

  return (
    <div>
      <Heading heading={'Playground'} onTimeRangeChangeCb={false} onRefreshCb={false} />
      <SuspenseLoader loading={isLoading} loader={<TableSkeleton />}>
        <PlaygroundTable
          playbookList={playbookList?.playbooks ?? []}
          total={total}
          pageSize={pageMeta ? pageMeta?.limit : 10}
          tableContainerStyles={
            playbookList?.playbooks?.length ? {} : { maxHeight: '35vh', minHeight: '35vh' }
          }
          refreshTable={refetch}
          showDelete={false}
        />
      </SuspenseLoader>
    </div>
  );
};

export default Playground;
