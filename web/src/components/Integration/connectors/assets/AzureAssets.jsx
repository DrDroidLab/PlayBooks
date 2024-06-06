import { KeyboardArrowDownRounded } from "@mui/icons-material";
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
    <div className="flex flex-col gap-2">
      {assets && assets.length > 0 && (
        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
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
                      <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
                        <AccordionSummary
                          expandIcon={<KeyboardArrowDownRounded />}
                          className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
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
      )}
    </div>
  );
};
