import React from "react";
// import GlobalVariables from '../../common/GlobalVariable';
import IntegrationsList from "./IntegrationsList";
import { integrationSentenceMap } from "../../../utils/integrationOptions/index.ts";

function Sidebar() {
  const heightList = window.innerHeight * 0.05;
  const length = Object.keys(integrationSentenceMap).length * heightList;
  return (
    <div
      className={`w-full p-2`}
      style={{
        paddingBottom: `${length}px`,
      }}>
      <IntegrationsList />
    </div>
  );
}

export default Sidebar;
