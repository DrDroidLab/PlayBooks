/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from 'react-router-dom';
import Heading from '../Heading';
import API from '../../API';
import { useCallback, useEffect, useState } from 'react';

import SuspenseLoader from '../Skeleton/SuspenseLoader';
import TableSkeleton from '../Skeleton/TableLoader';

import PlaybookTable from './PlayBookTable';

const Playbooks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [playbookList, setPlaybookList] = useState([]);

  const [total, setTotal] = useState(0);
  const [pageMeta, setPageMeta] = useState({ limit: 10, offset: 0 });

  const getPlaybooks = API.useGetPlaybooksData();

  const fetchData = () => {
    getPlaybooks(
      {
        meta: {
          page: pageMeta
        }
      },
      response => {
        if (response.data?.playbooks?.length > 0) {
          setPlaybookList(response.data.playbooks);
          setTotal(Number(response.data?.meta?.total_count));
        }
        setLoading(false);
      },
      err => {
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    if (loading) {
      setPlaybookList([]);
      fetchData();
    }
  }, [loading]);

  const pageUpdateCb = useCallback(
    (page, successCb, errCb) => {
      setPageMeta(page);
      getPlaybooks(
        {
          meta: {
            page
          }
        },
        resp => {
          setPlaybookList(resp.data?.playbooks);
          setTotal(Number(resp.data?.meta?.total_count));
          successCb(resp.data?.playbooks, Number(resp.data?.meta?.total_count));
        },
        err => {
          errCb(err);
        }
      );
    },
    [getPlaybooks]
  );

  const handleCreatePlaybook = () => {
    navigate({
      pathname: '/playbooks/create'
    });
  };

  return (
    <div>
      <Heading heading={'Playbooks'} onTimeRangeChangeCb={false} onRefreshCb={false} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '1.5rem',
          justifyContent: 'space-between'
        }}
      >
        <button
          className="text-sm bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg create_playbook"
          onClick={handleCreatePlaybook}
          style={{ color: 'white', marginTop: '0px', marginRight: '10px' }}
        >
          + Create Playbook
        </button>
      </div>
      <SuspenseLoader loading={!!loading} loader={<TableSkeleton />}>
        <PlaybookTable
          playbookList={playbookList}
          total={total}
          pageSize={pageMeta ? pageMeta?.limit : 10}
          pageUpdateCb={pageUpdateCb}
          tableContainerStyles={
            playbookList?.length ? {} : { maxHeight: '35vh', minHeight: '35vh' }
          }
          refreshTable={fetchData}
        ></PlaybookTable>
      </SuspenseLoader>
    </div>
  );
};

export default Playbooks;
