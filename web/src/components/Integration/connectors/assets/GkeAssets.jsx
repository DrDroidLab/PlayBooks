import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

export const GkeAssets = ({ assets }) => {
  return (
    <div className="flex flex-col gap-2">
      {assets && assets.length > 0 && (
        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
            <Typography>
              <p style={{ fontSize: "16px" }}>Zones ({assets.length})</p>{" "}
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
                              {item?.gke_cluster?.zone}
                            </b>
                            &nbsp;&nbsp;
                            <i style={{ fontSize: "14px" }}>
                              (Click for details)
                            </i>{" "}
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                          <List>
                            {item?.gke_cluster?.clusters?.map((cluster) => (
                              <ListItem>
                                <ListItemText primary={cluster.name} />
                              </ListItem>
                            ))}
                          </List>
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
