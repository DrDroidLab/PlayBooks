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
  Typography,
} from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

const TableComponent = ({ tables }) => {
  return (
    <div className="flex flex-col gap-2">
      {tables?.map((table, index) => (
        <Accordion
          className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0"
          key={index}>
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
            <Typography>
              <p style={{ fontSize: "16px" }}>{table.name}</p>{" "}
              <i style={{ fontSize: "14px" }}>(Click for details)</i>{" "}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ maxWidth: "20px" }}>
                      Column name
                    </TableCell>
                    <TableCell style={{ maxWidth: "20px" }}>
                      Column type
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {table.columns.map((col, index) => (
                    <TableRow style={{ fontSize: "10px" }}>
                      <TableCell style={{ maxWidth: "20px" }}>
                        <Typography>
                          <p style={{ fontSize: "16px" }}>{col.name}</p>{" "}
                        </Typography>
                      </TableCell>
                      <TableCell style={{ maxWidth: "20px" }}>
                        <Typography>
                          <p style={{ fontSize: "16px" }}>{col.type}</p>{" "}
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
    </div>
  );
};

export const ClickhouseAssets = ({ assets }) => {
  return (
    <div className="flex flex-col gap-2">
      {assets && assets.length > 0 && (
        <>
          <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
            <AccordionSummary
              expandIcon={<KeyboardArrowDownRounded />}
              className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
              <Typography>
                <p style={{ fontSize: "16px" }}>Databases ({assets.length})</p>{" "}
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Table stickyHeader>
                <TableBody>
                  {assets?.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}>
                      <TableCell component="th" scope="row">
                        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
                          <AccordionSummary
                            expandIcon={<KeyboardArrowDownRounded />}
                            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
                            <Typography>
                              <b style={{ fontSize: "16px" }}>
                                {item.clickhouse_database?.database}
                              </b>
                              &nbsp;&nbsp;
                              <i style={{ fontSize: "14px" }}>
                                (Click for details)
                              </i>{" "}
                            </Typography>
                          </AccordionSummary>

                          <AccordionDetails>
                            <TableComponent
                              tables={item?.clickhouse_database?.tables}
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
