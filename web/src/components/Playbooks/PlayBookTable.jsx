import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { renderTimestamp } from '../../utils/DateUtils';
import PaginatedTable from '../PaginatedTable';
import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';

import { Link, useNavigate } from 'react-router-dom';
import NoExistingPlaybook from './NoExistingPlaybook';
import styles from './playbooks.module.css';
import useToggle from '../../hooks/useToggle';
import PlaybookActionOverlay from './PlaybookActionOverlay';
import { ContentCopy, Edit } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { copyPlaybook, setCurrentPlaybook } from '../../store/features/playbook/playbookSlice.ts';
import { useLazyGetPlaybookQuery } from '../../store/features/playbook/api/index.ts';

const PlaybookTableRender = ({ data, refreshTable, showDelete = true }) => {
  const navigate = useNavigate();
  const { isOpen: isActionOpen, toggle } = useToggle();
  const [selectedPlaybook, setSelectedPlaybook] = useState({});
  const [triggerGetPlaybook] = useLazyGetPlaybookQuery();
  const dispatch = useDispatch();

  const handleDeletePlaybook = playbook => {
    setSelectedPlaybook(playbook);
    toggle();
  };

  const handleCopyPlaybook = async id => {
    const res = await triggerGetPlaybook({ playbookId: id }).unwrap();
    dispatch(copyPlaybook(res));
    navigate('/playbooks/create');
  };

  const handleEditPlaybook = async id => {
    navigate(`/playbooks/edit/${id}`);
  };

  const handleTriggers = item => {
    dispatch(setCurrentPlaybook(item));
    if (item.has_triggers) navigate(`/playbooks/triggers/${item.id}`);
    else navigate(`/playbooks/triggers/create/${item.id}`);
  };

  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className={styles['tableTitle']}>Name</TableCell>
            {showDelete && <TableCell className={styles['tableTitle']}>Triggers</TableCell>}
            {showDelete && <TableCell className={styles['tableTitle']}>Actions</TableCell>}
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
                <Link to={`/playbooks/${item.id}`} className={styles['link']}>
                  {item.name}
                </Link>
              </TableCell>
              {showDelete && (
                <TableCell component="th" scope="row">
                  <button onClick={() => handleTriggers(item)} className={styles['pb-button']}>
                    {item.has_triggers ? 'View' : 'Add'}
                  </button>
                </TableCell>
              )}
              {showDelete && (
                <TableCell component="th" scope="row">
                  <div className="flex gap-2">
                    <button
                      className={styles['pb-button']}
                      onClick={() => handleCopyPlaybook(item.id)}
                    >
                      <Tooltip title="Copy this Playbook">
                        <ContentCopy />
                      </Tooltip>
                    </button>
                    <button
                      className={styles['pb-button']}
                      onClick={() => handleDeletePlaybook(item)}
                    >
                      <Tooltip title="Remove this Playbook">
                        <DeleteIcon />
                      </Tooltip>
                    </button>
                    <button
                      className={styles['pb-button']}
                      onClick={() => handleEditPlaybook(item.id)}
                    >
                      <Tooltip title="Edit this Playbook">
                        <Edit />
                      </Tooltip>
                    </button>
                  </div>
                </TableCell>
              )}
              <TableCell component="th" scope="row">
                {renderTimestamp(item.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!data?.length ? <NoExistingPlaybook /> : null}
      <PlaybookActionOverlay
        playbook={selectedPlaybook}
        isOpen={isActionOpen}
        toggleOverlay={toggle}
        refreshTable={refreshTable}
      />
    </>
  );
};

const PlaybookTable = ({
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
      renderTable={PlaybookTableRender}
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

export default PlaybookTable;
