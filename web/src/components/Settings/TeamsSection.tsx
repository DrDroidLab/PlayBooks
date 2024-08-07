import React from "react";
import SettingsTitle from "./SettingsTitle.tsx";
import CustomButton from "../common/CustomButton/index.tsx";
import { useNavigate } from "react-router-dom";
import { OpenInNewRounded } from "@mui/icons-material";

function TeamsSection() {
  const navigate = useNavigate();
  const handleNavigateToTeamSection = () => {
    navigate("/settings/invite-team");
  };

  return (
    <section className="border-b pb-4 mb-4">
      <SettingsTitle title="Team" />
      <div className="mt-2">
        <CustomButton onClick={handleNavigateToTeamSection}>
          <OpenInNewRounded /> Manage Team
        </CustomButton>
      </div>
    </section>
  );
}

export default TeamsSection;
