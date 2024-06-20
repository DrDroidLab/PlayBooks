/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  toggleStep,
} from "../../store/features/playbook/playbookSlice.ts";
import Step from "./steps/Step.jsx";
import PlaybookTitle from "../common/PlaybookTitle.jsx";
import GlobalVariables from "../common/GlobalVariable/index.jsx";
import { setPlaybookState } from "../../store/features/timeRange/timeRangeSlice.ts";
import { KeyboardArrowDownRounded } from "@mui/icons-material";

const ListView = () => {
  const dispatch = useDispatch();
  const { steps } = useSelector(playbookSelector);

  useEffect(() => {
    dispatch(setPlaybookState());
  }, [dispatch]);

  return (
    <div className="flex flex-col h-full w-full lg:w-2/3 m-auto">
      <GlobalVariables />

      <div className="flex-1 p-1 bg-white border rounded m-2 overflow-scroll">
        <div className="flex flex-col gap-2">
          {steps?.map((step, index) => (
            <Accordion
              key={index}
              aria-expanded={step.isOpen}
              expanded={step.isOpen}
              onChange={() => dispatch(toggleStep(index))}
              className="!rounded !shadow-none !border before:!content-none overflow-hidden aria-expanded:!m-0">
              <AccordionSummary
                expandIcon={<KeyboardArrowDownRounded />}
                aria-expanded={step.isOpen}
                className="!bg-gray-100 !shadow-none !border-none hover:!bg-gray-50 !transition-all">
                <PlaybookTitle step={step} index={index} />
              </AccordionSummary>
              <AccordionDetails className="!p-2">
                <Step step={step} index={index} />
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListView;
