import React from "react";
// import GlobalVariables from '../../common/GlobalVariable';
import IntegrationsList from "./IntegrationsList";
import { integrationSentenceMap } from "../../../utils/integrationOptions/index.ts";

function Sidebar({ setIsOpen }) {
  return (
    <div
      className={`w-full p-2`}
      style={{
        paddingBottom: `${Object.keys(integrationSentenceMap).length * 25}px`,
      }}>
      {/* <div className="p-1 border-[2px] border-gray-100 rounded max-w-full">
        <GlobalVariables />
      </div> */}
      <IntegrationsList setIsOpen={setIsOpen} />
    </div>
  );
}

export default Sidebar;
