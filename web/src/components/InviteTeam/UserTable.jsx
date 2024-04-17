import { LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import PaginatedTable from '../PaginatedTable';
import styles from './index.module.css';

const UserTableRender = ({ data, loading, refreshTable }) => {
  return (
    <>
      {loading ? <LinearProgress /> : null}
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className={styles['tableTitle']}>Name</TableCell>
            <TableCell className={styles['tableTitle']}>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow
              key={index}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 }
              }}
            >
              <TableCell component="th" scope="row">
                {item.first_name + ' ' + item.last_name}
              </TableCell>
              <TableCell component="th" scope="row">
                {item.email}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

const UserTable = ({ userList, total, pageSize, pageUpdateCb, tableContainerStyles, isCard }) => {
  return (
    <PaginatedTable
      renderTable={UserTableRender}
      data={userList}
      total={total}
      pageSize={pageSize}
      pageUpdateCb={pageUpdateCb}
      tableContainerStyles={tableContainerStyles ? tableContainerStyles : {}}
    />
  );
};

export default UserTable;
