import React from "react";
import SettingsTitle from "./SettingsTitle.tsx";
import CustomButton from "../common/CustomButton/index.tsx";
import { useNavigate } from "react-router-dom";
import { OpenInNewRounded } from "@mui/icons-material";

function ApiSection() {
  const navigate = useNavigate();
  const handleNavigateToApiSection = () => {
    navigate("/api-keys");
  };

  return (
    <section className="border-b pb-4 mb-4">
      <SettingsTitle title="API Tokens" />
      <div className="mt-2">
        <CustomButton onClick={handleNavigateToApiSection}>
          <OpenInNewRounded />
          Manage API Tokens
        </CustomButton>
      </div>
    </section>
  );
}

export default ApiSection;
