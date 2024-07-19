import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import React from "react";

export const GcmAssets = ({ assets }) => {
  return (
    <div className="flex flex-col gap-2">
      {assets && assets.length > 0 && (
        <Accordion className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
          <AccordionSummary
            expandIcon={<KeyboardArrowDownRounded />}
            className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
            <Typography>
              <p style={{ fontSize: "16px" }}>Metric Types ({assets.length})</p>{" "}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            {assets.map((item, index) => (
              <Typography key={index}>
                {item.gcm_metric?.metric_type}
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
};
