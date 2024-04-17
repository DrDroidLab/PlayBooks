import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { renderTimestamp } from '../../utils/DateUtils';
import PaginatedTable from '../PaginatedTable';
import { Link } from 'react-router-dom';
import styles from './index.module.css';
import NoExistingPlayground from './NoExistingPlayground';

const PlaygroundTableRender = ({ data }) => {
  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className={styles['tableTitle']}>Name</TableCell>
            <TableCell className={styles['tableTitle']}>Created At</TableCell>
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
                <Link to={`/playgrounds/${item.id}`} className={styles['link']}>
                  {item.name}
                </Link>
              </TableCell>
              <TableCell component="th" scope="row">
                {renderTimestamp(item.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!data?.length ? <NoExistingPlayground /> : null}
    </>
  );
};

const PlaygroundTable = ({
  playbookList,
  total,
  pageSize,
  pageUpdateCb,
  tableContainerStyles,
  refreshTable,
  showDelete
}) => {
  return (
    <PaginatedTable
      renderTable={PlaygroundTableRender}
      data={playbookList ?? []}
      showDelete={showDelete}
      total={total}
      pageSize={pageSize}
      pageUpdateCb={pageUpdateCb}
      tableContainerStyles={tableContainerStyles ? tableContainerStyles : {}}
      refreshTable={refreshTable}
    />
  );
};

export default PlaygroundTable;
