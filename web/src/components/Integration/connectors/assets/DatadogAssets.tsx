import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

export const DataDogAssets = ({ assets }) => {
  if (assets?.length === 0) {
    return <CircularProgress />;
  }

  const services = assets
    ?.filter((e) => e.datadog_service !== undefined)
    .map((e) => e.datadog_service);
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
            {services.map((item, index) => (
              <Accordion
                className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0"
                key={index}>
                <AccordionSummary
                  expandIcon={<KeyboardArrowDownRounded />}
                  className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
                  <Typography>
                    <p style={{ fontSize: "16px" }}>{item.service_name}</p>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>Metric Families</Typography>
                  {Object.entries(
                    item.metrics.reduce((acc, curr) => {
                      if (!acc[curr.metric_family]) {
                        acc[curr.metric_family] = [];
                      }
                      acc[curr.metric_family].push(curr.metric);
                      return acc;
                    }, {}),
                  ).map((metric, i) => (
                    <Accordion
                      className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0"
                      key={i}>
                      <AccordionSummary
                        expandIcon={<KeyboardArrowDownRounded />}
                        className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
                        <Typography>
                          <p style={{ fontSize: "16px" }}>{metric[0]}</p>
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List>
                          {(metric as any)?.[1]?.map((metric_name) => (
                            <ListItem>
                              <ListItemText primary={metric_name} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
};
