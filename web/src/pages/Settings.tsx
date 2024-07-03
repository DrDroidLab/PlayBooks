import React from "react";
import Heading from "../components/Heading";
import UserSection from "../components/Settings/UserSection.tsx";
import SiteSection from "../components/Settings/SiteSection.tsx";

function Settings() {
  return (
    <main>
      <Heading
        heading={"Settings"}
        children={undefined}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />

      <div className="bg-white m-2 rounded-lg p-2">
        <UserSection />
        <SiteSection />
      </div>
    </main>
  );
}

export default Settings;
