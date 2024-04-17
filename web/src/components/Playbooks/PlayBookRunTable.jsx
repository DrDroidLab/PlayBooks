import { LinearProgress, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { renderTimestamp } from '../../utils/DateUtils';
import { Link } from 'react-router-dom';
import PaginatedTable from '../PaginatedTable';
import NoExistingPlaybookRun from './NoExistingPlaybookRun';
import styles from './index.module.css';

const PlaybookRunTableRender = ({ data, loading }) => {
  return (
    <>
      {loading ? <LinearProgress /> : null}
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className={styles['tableTitle']}>Run ID</TableCell>
            <TableCell className={styles['tableTitle']}>Run At</TableCell>
            <TableCell className={styles['tableTitle']}>Status</TableCell>
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
                <Link to={`/playbook-runs/${item.playbook_run_id}`} className={styles['link']}>
                  {item.playbook_run_id}
                </Link>
              </TableCell>
              <TableCell component="th" scope="row">
                {renderTimestamp(item.started_at)}
              </TableCell>
              <TableCell component="th" scope="row">
                <span key={index} className={styles['status-chip-' + item.status]}>
                  {item.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!data?.length ? <NoExistingPlaybookRun /> : null}
    </>
  );
};

const PlaybookRunTable = ({
  playbookRunList,
  total,
  pageSize,
  pageUpdateCb,
  tableContainerStyles,
  isCard
}) => {
  return (
    <PaginatedTable
      renderTable={PlaybookRunTableRender}
      data={playbookRunList}
      total={total}
      pageSize={pageSize}
      pageUpdateCb={pageUpdateCb}
      tableContainerStyles={tableContainerStyles ? tableContainerStyles : {}}
    />
  );
};

export default PlaybookRunTable;
