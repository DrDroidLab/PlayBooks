import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  CircularProgress,
} from "@mui/material";
import { Typography } from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

export const NewRelicAssets = ({ assets }) => {
  if (assets?.length === 0) {
    return <CircularProgress />;
  }

  const services = assets
    ?.filter((e) => e.new_relic_entity_application !== undefined)
    .map((e) => e.new_relic_entity_application);
  const dashboards = assets
    ?.filter((e) => e.new_relic_entity_dashboard !== undefined)
    .map((e) => e.new_relic_entity_dashboard);

  return (
    <div className="flex flex-col gap-2">
      {services && services.length > 0 && (
        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
            <Typography>
              <p style={{ fontSize: "16px" }}>Services ({services.length})</p>{" "}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Table stickyHeader>
              <TableBody>
                {services?.map((item, index) => (
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
                              {item.application_name}
                            </b>
                            &nbsp;&nbsp;
                            <i style={{ fontSize: "14px" }}>
                              (Click for details)
                            </i>{" "}
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                          <TableContainer key={index}>
                            <Table stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell style={{ maxWidth: "20px" }}>
                                    Name
                                  </TableCell>
                                  <TableCell style={{ maxWidth: "40px" }}>
                                    Expression
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {item.golden_metrics?.map((item, index) => (
                                  <TableRow
                                    key={index}
                                    sx={{
                                      "&:last-child td, &:last-child th": {
                                        border: 0,
                                      },
                                    }}>
                                    <TableCell style={{ maxWidth: "20px" }}>
                                      {item.golden_metric_name}
                                    </TableCell>
                                    <TableCell style={{ maxWidth: "20px" }}>
                                      {item.golden_metric_nrql_expression}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
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

      {dashboards && dashboards.length > 0 && (
        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
            <Typography>
              <p style={{ fontSize: "16px" }}>
                Dashboards ({dashboards.length})
              </p>{" "}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Table stickyHeader>
              <TableBody>
                {dashboards?.map((item, index) => (
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
                              {item.dashboard_name}
                            </b>
                            &nbsp;&nbsp;
                            <i style={{ fontSize: "14px" }}>
                              (Click for details)
                            </i>{" "}
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                          {item.pages.map((page, index) => (
                            <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
                              <AccordionSummary
                                key={index}
                                expandIcon={<KeyboardArrowDownRounded />}
                                className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
                                <Typography>
                                  <p style={{ fontSize: "16px" }}>
                                    {page.page_name}
                                  </p>{" "}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TableContainer>
                                  <Table stickyHeader>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell style={{ maxWidth: "20px" }}>
                                          Title
                                        </TableCell>
                                        <TableCell style={{ maxWidth: "40px" }}>
                                          Expression
                                        </TableCell>
                                        <TableCell style={{ maxWidth: "40px" }}>
                                          Type
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {page.widgets?.map((item, index) => (
                                        <TableRow
                                          key={index}
                                          sx={{
                                            "&:last-child td, &:last-child th":
                                              { border: 0 },
                                          }}>
                                          <TableCell
                                            style={{ maxWidth: "20px" }}>
                                            {item.widget_title}
                                          </TableCell>
                                          <TableCell
                                            style={{ maxWidth: "20px" }}>
                                            {item.widget_nrql_expression}
                                          </TableCell>
                                          <TableCell
                                            style={{ maxWidth: "20px" }}>
                                            {item.widget_type}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </AccordionDetails>
                            </Accordion>
                          ))}
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
