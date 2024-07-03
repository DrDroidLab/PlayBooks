import { Tooltip, TooltipProps, tooltipClasses } from "@mui/material";
import React from "react";

interface CustomTooltipProps extends TooltipProps {
  className?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  className,
  ...props
}) => {
  const tooltipStyles = `${className} ${tooltipClasses.tooltip}`;

  return <Tooltip {...props} classes={{ tooltip: tooltipStyles }} />;
};
