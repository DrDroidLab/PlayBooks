import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

export const ElasticSearchAssets = ({ assets }) => {
  return (
    <div className="flex flex-col gap-2">
      {assets && assets.length > 0 && (
        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
            <Typography>
              <p style={{ fontSize: "16px" }}>Indexes ({assets.length})</p>{" "}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <List>
              {assets?.map((asset) => (
                <ListItem>
                  <ListItemText primary={asset?.elastic_search_index?.index} />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
};
