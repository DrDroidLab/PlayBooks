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
import styles from "./index.module.css";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

const TableComponent = ({ dimensions }) => {
  return (
    <TableContainer>
      {dimensions?.map((dim, index) => (
        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
            <Typography>
              <b style={{ fontSize: "16px" }}>{dim.region}</b>
              &nbsp;&nbsp;
              <i style={{ fontSize: "14px" }}>(Click for details)</i>{" "}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ maxWidth: "20px" }}>Dimension</TableCell>
                  <TableCell style={{ maxWidth: "50px" }}>Components</TableCell>
                  <TableCell style={{ maxWidth: "50px" }}>Metrics</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dim?.dimensions?.map((rdim, index) => (
                  <TableRow style={{ fontSize: "10px" }}>
                    <TableCell style={{ maxWidth: "20px" }}>
                      {rdim?.name}
                    </TableCell>
                    <TableCell style={{ maxWidth: "50px" }}>
                      <div className={styles["chips"]}>
                        {rdim?.values.map((item, index) => (
                          <span key={index} className={styles["chip"]}>
                            {item}
                            <br />
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell style={{ maxWidth: "50px" }}>
                      <div className={styles["chips"]}>
                        {rdim?.metrics.map((item, index) => (
                          <span key={index} className={styles["chip"]}>
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
    <div className="flex flex-col gap-2">
      {assets && assets.length > 0 && (
        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
            <Typography>
              <p style={{ fontSize: "16px" }}>Namespaces ({assets.length})</p>{" "}
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
                              {item?.cloudwatch_metric?.namespace}
                            </b>
                            &nbsp;&nbsp;
                            <i style={{ fontSize: "14px" }}>
                              (Click for details)
                            </i>{" "}
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                          <TableComponent
                            dimensions={
                              item?.cloudwatch_metric?.region_dimension_map
                            }
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
      )}
    </div>
  );
};
