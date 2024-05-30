import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

const TableComponent = ({ panels }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ maxWidth: '40px' }}>Panel</TableCell>
            <TableCell style={{ maxWidth: '40px' }}>Prometheus Queries</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {panels.map((panel, index) => (
            <>
              {panel.promql_metrics && (
                <TableRow style={{ fontSize: '10px' }}>
                  <TableCell style={{ maxWidth: '40px', textOverflow: '' }}>
                    {panel.panel_title}
                  </TableCell>
                  <TableCell style={{ maxWidth: '40px' }}>
                    {panel.promql_metrics?.map(e => (
                      <div key={index}>
                        <li>{e.expression + '\n'}</li>
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const GrafanaAssets = ({ assets }) => {
  return (
    <div>
      {assets && assets.length > 0 && (
        <>
          <br />
          <Accordion style={{ borderRadius: '5px' }} className="collapsible_option">
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              style={{ borderRadius: '5px', backgroundColor: '#f5f5f5' }}
            >
              <Typography>
                <p style={{ fontSize: '16px' }}>Prometheus Metrics ({assets.length})</p>{' '}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Table stickyHeader>
                <TableBody>
                  {assets?.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Accordion
                          style={{ borderRadius: '5px', marginTop: '10px' }}
                          className="collapsible_option"
                        >
                          <AccordionSummary
                            expandIcon={<ArrowDropDownIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                            style={{ borderRadius: '5px', backgroundColor: '#f5f5f5' }}
                          >
                            <Typography>
                              <b style={{ fontSize: '16px' }}>
                                {item.grafana_target_metric_promql?.dashboard_title}
                              </b>
                              &nbsp;&nbsp;
                              <i style={{ fontSize: '14px' }}>(Click for details)</i>{' '}
                            </Typography>
                          </AccordionSummary>

                          <AccordionDetails>
                            {item?.grafana_target_metric_promql?.panel_promql_map?.length > 0 && (
                              <TableComponent
                                panels={item?.grafana_target_metric_promql?.panel_promql_map}
                                dataType={'Prometheus Queries'}
                              />
                            )}
                          </AccordionDetails>
                        </Accordion>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </div>
  );
};
