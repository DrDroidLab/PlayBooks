import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";

export const AzureAssets = ({ assets }) => {
  return (
    <div>
      {assets && assets.length > 0 && (
        <>
          <br />
          <Accordion
            style={{ borderRadius: "5px" }}
            className="collapsible_option">
            <AccordionSummary
              expandIcon={<ArrowDropDownIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              style={{ borderRadius: "5px", backgroundColor: "#f5f5f5" }}>
              <Typography>
                <p style={{ fontSize: "16px" }}>
                  Azure Workspaces ({assets.length})
                </p>{" "}
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
                        <Accordion
                          style={{ borderRadius: "5px", marginTop: "10px" }}
                          className="collapsible_option">
                          <AccordionSummary
                            expandIcon={<ArrowDropDownIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                            style={{
                              borderRadius: "5px",
                              backgroundColor: "#f5f5f5",
                            }}>
                            <Typography>
                              <b style={{ fontSize: "16px" }}>
                                {item.azure_workspace?.name}
                              </b>
                              &nbsp;&nbsp;
                              <i style={{ fontSize: "14px" }}>
                                (Click for details)
                              </i>{" "}
                            </Typography>
                          </AccordionSummary>

                          <AccordionDetails>
                            <p>
                              <b>Workspace ID: </b>
                              {item.azure_workspace?.workspace}
                            </p>
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
