import { ContentCopy } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React, { useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { useDispatch } from "react-redux";
import { copyPlaybook } from "../../../store/features/playbook/playbookSlice.ts";
import { COPY_LOADING_DELAY } from "../../../constants/index.ts";
import Loading from "../../common/Loading/index.tsx";
import { useNavigate } from "react-router-dom";

function CopyPlaybookButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [copyLoading, setCopyLoading] = useState(false);

  const handleCopyPlaybook = async () => {
    setCopyLoading(true);
    setTimeout(() => {
      dispatch(copyPlaybook({ useState: true }));
      setCopyLoading(false);
      navigate("/playbooks/create", {
        replace: true,
      });
    }, COPY_LOADING_DELAY);
  };

  if (copyLoading) {
    return <Loading title="Copying your playbook..." />;
  }

  return (
    <CustomButton onClick={handleCopyPlaybook}>
      <Tooltip title="Duplicate this Playbook">
        <>
          <ContentCopy />
          <p>Duplicate</p>
        </>
      </Tooltip>
    </CustomButton>
  );
}

export default CopyPlaybookButton;
