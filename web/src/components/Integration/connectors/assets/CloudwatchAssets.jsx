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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import styles from './index.module.css';

const TableComponent = ({ dimensions }) => {
  return (
    <TableContainer>
      {dimensions?.map((dim, index) => (
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
              <b style={{ fontSize: '16px' }}>{dim.region}</b>
              &nbsp;&nbsp;
              <i style={{ fontSize: '14px' }}>(Click for details)</i>{' '}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ maxWidth: '20px' }}>Dimension</TableCell>
                  <TableCell style={{ maxWidth: '50px' }}>Components</TableCell>
                  <TableCell style={{ maxWidth: '50px' }}>Metrics</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dim?.dimensions?.map((rdim, index) => (
                  <TableRow style={{ fontSize: '10px' }}>
                    <TableCell style={{ maxWidth: '20px' }}>{rdim?.name}</TableCell>
                    <TableCell style={{ maxWidth: '50px' }}>
                      <div className={styles['chips']}>
                        {rdim?.values.map((item, index) => (
                          <span key={index} className={styles['chip']}>
                            {item}
                            <br />
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell style={{ maxWidth: '50px' }}>
                      <div className={styles['chips']}>
                        {rdim?.metrics.map((item, index) => (
                          <span key={index} className={styles['chip']}>
                            {item}
                            <br />
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
    </TableContainer>
  );
};

export const CloudwatchAssets = ({ assets }) => {
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
                <p style={{ fontSize: '16px' }}>Namespaces ({assets.length})</p>{' '}
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
                                {item?.cloudwatch_metric?.namespace}
                              </b>
                              &nbsp;&nbsp;
                              <i style={{ fontSize: '14px' }}>(Click for details)</i>{' '}
                            </Typography>
                          </AccordionSummary>

                          <AccordionDetails>
                            <TableComponent
                              dimensions={item?.cloudwatch_metric?.region_dimension_map}
                            />
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
