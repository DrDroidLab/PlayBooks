import React from "react";
// import GlobalVariables from '../../common/GlobalVariable';
import IntegrationsList from "./IntegrationsList";
import { integrationSentenceMap } from "../../../utils/integrationOptions/index.ts";

function Sidebar({ setIsOpen }) {
  const heightList =
    window.innerHeight * (window.innerHeight > 900 ? 0.03 : 0.04);
  const length = Object.keys(integrationSentenceMap).length * heightList;
  return (
    <div
      className={`w-full p-2`}
      style={{
        paddingBottom: `${length}px`,
      }}>
      {/* <div className="p-1 border-[2px] border-gray-100 rounded max-w-full">
        <GlobalVariables />
      </div> */}
      <IntegrationsList setIsOpen={setIsOpen} />
    </div>
  );
}

export default Sidebar;
