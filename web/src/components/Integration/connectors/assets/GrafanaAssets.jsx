import { KeyboardArrowDownRounded } from "@mui/icons-material";
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

const TableComponent = ({ panels }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ maxWidth: "40px" }}>Panel</TableCell>
            <TableCell style={{ maxWidth: "40px" }}>
              Prometheus Queries
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {panels.map((panel, index) => (
            <>
              {panel.promql_metrics && (
                <TableRow style={{ fontSize: "10px" }}>
                  <TableCell style={{ maxWidth: "40px", textOverflow: "" }}>
                    {panel.panel_title}
                  </TableCell>
                  <TableCell style={{ maxWidth: "40px" }}>
                    {panel.promql_metrics?.map((e) => (
                      <div key={index}>
                        <li>{e.expression + "\n"}</li>
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
    <div className="flex flex-col gap-2">
      {assets && assets.length > 0 && (
        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
            <Typography>
              <p style={{ fontSize: "16px" }}>Data Sources ({assets.length})</p>{" "}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Table stickyHeader>
              <TableBody>
                {assets?.map((item, index) => (
                  <>
                    {item.type === "GRAFANA_PROMETHEUS_DATASOURCE" && (
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
                                  {
                                    item.grafana_prometheus_datasource
                                      ?.datasource_name
                                  }
                                </b>
                                &nbsp;&nbsp;
                              </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                              <p>
                                <b>Type: </b>
                                {
                                  item.grafana_prometheus_datasource
                                    ?.datasource_typeName
                                }
                              </p>
                              <p>
                                <b>UID: </b>
                                {
                                  item.grafana_prometheus_datasource
                                    ?.datasource_uid
                                }
                              </p>
                              <p>
                                <b>URL: </b>
                                {
                                  item.grafana_prometheus_datasource
                                    ?.datasource_url
                                }
                              </p>
                            </AccordionDetails>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    )}
                    {item.type === "GRAFANA_TARGET_METRIC_PROMQL" && (
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
                                Dashboard:{" "}
                                <b style={{ fontSize: "16px" }}>
                                  {
                                    item.grafana_target_metric_promql
                                      ?.dashboard_title
                                  }
                                </b>
                                &nbsp;&nbsp;
                              </Typography>
                            </AccordionSummary>

                            <AccordionDetails>
                              {item?.grafana_target_metric_promql
                                ?.panel_promql_map?.length > 0 && (
                                <TableComponent
                                  panels={
                                    item?.grafana_target_metric_promql
                                      ?.panel_promql_map
                                  }
                                  dataType={"Prometheus Queries"}
                                />
                              )}
                            </AccordionDetails>
                          </Accordion>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
};
