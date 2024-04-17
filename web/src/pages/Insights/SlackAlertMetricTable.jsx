/* eslint-disable react-hooks/exhaustive-deps */
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useEffect, useState } from 'react';
import SeeMoreText from '../../components/Playbooks/SeeMoreText.jsx';
import { Launch } from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import { useLazyGetSlackAlertMetricQuery } from '../../store/features/alertInsights/api/index.ts';
import { useDispatch } from 'react-redux';
import { setName } from '../../store/features/playbook/playbookSlice.ts';
import { useNavigate } from 'react-router-dom';
import { formatString } from '../../utils/formatString.ts';

const itemsPerPage = 5;

const columnNames = [
  'Alert',
  'Week 1',
  'Week 2',
  'Week 3',
  'Week 4',
  'Week 5',
  'Current Week',
  'Actions'
];

function SlackAlertMetricTable({ filter_channels, filter_alert_types }) {
  const [triggergetSlackAlertMetric, { isFetching, data }] = useLazyGetSlackAlertMetricQuery();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);

  useEffect(() => {
    triggergetSlackAlertMetric({ filter_channels, filter_alert_types });
  }, [filter_alert_types, filter_channels]);

  const csvData = [
    columnNames,
    ...(data?.map(item => [item?.label_group[0]?.value, ...item.y_series.map(e => e)]) ?? [])
  ];

  const handleEnrichment = e => {
    const name = e.target.name;

    const formattedName = formatString({ str: name });

    dispatch(setName(formattedName));
    navigate('/playbooks/create');
  };

  const handleSeeMore = () => {
    setPage(page + 1);
  };

  return (
    <Accordion
      style={{ borderRadius: '5px' }}
      className="collapsible_option"
      defaultExpanded={true}
    >
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        style={{ borderRadius: '5px', backgroundColor: '#f5f5f5' }}
      >
        <Typography>
          <b style={{ fontSize: '18px' }}>Distribution of alerts</b>{' '}
          <i style={{ fontSize: '15px' }}>(Click to open/close)</i>
        </Typography>
        <div className="flex items-center gap-1 ml-2 text-sm" onClick={e => e.stopPropagation()}>
          <CSVLink data={csvData}>
            <Launch />
            <span>Export CSV</span>
          </CSVLink>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        {isFetching ? (
          <>
            <div
              style={{
                textAlign: 'center',
                fontSize: '20px'
              }}
            >
              <CircularProgress />
            </div>
          </>
        ) : (
          <>
            {data?.length > 0 ? (
              <>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {columnNames.map(columnName => (
                        <TableCell style={{ fontWeight: 800 }}>{columnName}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data
                      .filter((_, i) => i < page * itemsPerPage)
                      ?.map((item, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 }
                          }}
                        >
                          <TableCell component="td" scope="row">
                            <SeeMoreText
                              title={columnNames[0]}
                              text={item?.label_group[0]?.value}
                              truncSize={200}
                            />
                          </TableCell>
                          {item?.y_series?.map(e => (
                            <TableCell component="td" scope="row">
                              {e}
                            </TableCell>
                          ))}
                          <TableCell component="td" scope="row">
                            {index < 5 && (
                              <button
                                name={item?.label_group[0]?.value}
                                onClick={handleEnrichment}
                                className="bg-transparent hover:bg-violet-500 border-violet-500 border-2 text-violet-500 hover:text-white p-1 rounded transition-all"
                              >
                                Enrich Alert
                              </button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {data.length > page * itemsPerPage && (
                  <p
                    style={{ width: 'fit-content' }}
                    className="bg-transparent hover:bg-violet-500 border-violet-500 border-2 text-violet-500 hover:text-white p-1 rounded transition-all cursor-pointer"
                    onClick={handleSeeMore}
                  >
                    See more
                  </p>
                )}
              </>
            ) : (
              <>
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '20px'
                  }}
                >
                  No Noisy Alerts found
                </div>
              </>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default SlackAlertMetricTable;
