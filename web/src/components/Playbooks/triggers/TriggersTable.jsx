import { Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@mui/material';
import { renderTimestamp } from '../../../utils/DateUtils';
import PaginatedTable from '../../PaginatedTable';
import { useState } from 'react';
import styles from './index.module.css';
import NoExistingTrigger from './NoExistingTrigger';
import { Delete, RemoveRedEyeRounded } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { playbookSelector } from '../../../store/features/playbook/playbookSlice.ts';
import TriggerActionOverlay from './TriggerActionOverlay.jsx';
import useToggle from '../../../hooks/useToggle.js';

const TriggersTableRender = ({ data, refreshTable }) => {
  const { isOpen: isActionOpen, toggle } = useToggle();
  const [selectedTrigger, setSelectedTrigger] = useState({});
  const { currentPlaybook } = useSelector(playbookSelector);

  const handleDelete = trigger => {
    setSelectedTrigger(trigger);
    toggle();
  };

  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className={styles['tableTitle']}>Type</TableCell>
            <TableCell className={styles['tableTitle']}>Added on</TableCell>
            <TableCell className={styles['tableTitle']}>Added by</TableCell>
            <TableCell className={styles['tableTitle']}>Actions</TableCell>
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
              <TableCell component="td" scope="row">
                {item?.definition?.type}
              </TableCell>
              <TableCell component="td" scope="row">
                {renderTimestamp(item.created_at)}
              </TableCell>
              <TableCell component="td" scope="row">
                {item.created_by}
              </TableCell>
              <TableCell component="td" scope="row">
                <Link
                  className={styles['pb-button']}
                  to={`/playbooks/triggers/view/${currentPlaybook.id}/${item.id}`}
                >
                  <Tooltip title="View details">
                    <RemoveRedEyeRounded />
                  </Tooltip>
                </Link>

                <button className={styles['pb-button']} onClick={() => handleDelete(item)}>
                  <Tooltip title="Delete Trigger">
                    <Delete />
                  </Tooltip>
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TriggerActionOverlay
        playbook={currentPlaybook}
        trigger={selectedTrigger}
        isOpen={isActionOpen}
        toggleOverlay={toggle}
        refreshTable={refreshTable}
      />
      {!data?.length ? <NoExistingTrigger /> : null}
    </>
  );
};

const TriggersTable = ({
  playbookList,
  total,
  pageSize,
  tableContainerStyles,
  refreshTable,
  showDelete
}) => {
  return (
    <PaginatedTable
      renderTable={TriggersTableRender}
      data={playbookList ?? []}
      showDelete={showDelete}
      total={total}
      pageSize={pageSize}
      pageUpdateCb={refreshTable}
      tableContainerStyles={tableContainerStyles ? tableContainerStyles : {}}
      refreshTable={refreshTable}
    />
  );
};

export default TriggersTable;
