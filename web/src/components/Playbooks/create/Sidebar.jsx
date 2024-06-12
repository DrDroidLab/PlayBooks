import React from "react";
// import GlobalVariables from '../../common/GlobalVariable';
import IntegrationsList from "./IntegrationsList";
import { integrationSentenceMap } from "../../../utils/integrationOptions/index.ts";

function Sidebar({ setIsOpen, parentIndex, setParentIndex }) {
  const heightList = window.innerHeight * 0.05;
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
      <IntegrationsList
        parentIndex={parentIndex}
        setParentIndex={setParentIndex}
        setIsOpen={setIsOpen}
      />
    </div>
  );
}

export default Sidebar;
