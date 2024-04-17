/* eslint-disable react-hooks/exhaustive-deps */
import Heading from '../Heading';
import API from '../../API';
import { useEffect, useState } from 'react';
import useToggle from '../../hooks/useToggle';
import SuspenseLoader from '../Skeleton/SuspenseLoader';
import TableSkeleton from '../Skeleton/TableLoader';
import InviteUserOverlay from './InviteUserOverlay';
import UserTable from './UserTable';

function sortByKey(arr, key) {
  return arr.slice().sort((a, b) => {
    const valueA = a[key].toLowerCase();
    const valueB = b[key].toLowerCase();

    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0;
  });
}

const InviteTeam = () => {
  const { isOpen: isActionOpen, toggle } = useToggle();
  const [loading, setLoading] = useState(true);

  const [userList, setUserList] = useState([]);

  const [total] = useState(0);
  const [pageMeta] = useState({ limit: 10, offset: 0 });

  const getAccountUsers = API.useGetAccountUsers();

  useEffect(() => {
    getAccountUsers(
      response => {
        if (response.data?.users?.length > 0) {
          setUserList(sortByKey(response.data.users, 'first_name'));
        }
        setLoading(false);
      },
      err => {
        setLoading(false);
      }
    );
  }, []);

  const handleInviteUsers = () => {
    toggle();
  };

  return (
    <div>
      <Heading heading={'Invite Team'} onTimeRangeChangeCb={false} onRefreshCb={false} />
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
          className="text-sm bg-violet-600 hover:bg-violet-700 px-4 py-2  rounded-lg"
          onClick={handleInviteUsers}
          style={{ color: 'white', marginTop: '0px', marginRight: '10px' }}
        >
          + Invite Users
        </button>
      </div>
      <SuspenseLoader loading={!!loading} loader={<TableSkeleton />}>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '1.5rem',
            margin: '0rem 0.5rem 0.5rem 0.5rem'
          }}
        >
          Active Users
        </h1>
        <UserTable
          userList={userList}
          total={total}
          pageSize={pageMeta ? pageMeta?.limit : 10}
          pageUpdateCb={() => setLoading(true)}
          tableContainerStyles={userList?.length ? {} : { maxHeight: '35vh', minHeight: '35vh' }}
        ></UserTable>
      </SuspenseLoader>
      <InviteUserOverlay isOpen={isActionOpen} toggleOverlay={toggle} />
    </div>
  );
};

export default InviteTeam;
