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

const TableComponent = ({ tables }) => {
  return (
    <>
      {tables?.map((table, index) => (
        <Accordion key={index}>
          <AccordionSummary
            expandIcon={<ArrowDropDownIcon />}
            aria-controls="tables-content"
            id="tables-header"
            style={{ borderRadius: '5px', backgroundColor: '#f5f5f5' }}
          >
            <Typography>
              <p style={{ fontSize: '16px' }}>{table.name}</p>{' '}
              <i style={{ fontSize: '14px' }}>(Click for details)</i>{' '}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ maxWidth: '20px' }}>Column name</TableCell>
                    <TableCell style={{ maxWidth: '20px' }}>Column type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {table.columns.map((col, index) => (
                    <TableRow style={{ fontSize: '10px' }}>
                      <TableCell style={{ maxWidth: '20px' }}>
                        <Typography>
                          <p style={{ fontSize: '16px' }}>{col.column_name}</p>{' '}
                        </Typography>
                      </TableCell>
                      <TableCell style={{ maxWidth: '20px' }}>
                        <Typography>
                          <p style={{ fontSize: '16px' }}>{col.data_type}</p>{' '}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

export const PostgresAssets = ({ assets }) => {
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
                <p style={{ fontSize: '16px' }}>Databases ({assets.length})</p>{' '}
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
                              <b style={{ fontSize: '16px' }}>{item.postgres_database?.database}</b>
                              &nbsp;&nbsp;
                              <i style={{ fontSize: '14px' }}>(Click for details)</i>{' '}
                            </Typography>
                          </AccordionSummary>

                          <AccordionDetails>
                            <TableComponent tables={item?.postgres_database?.tables} />
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
