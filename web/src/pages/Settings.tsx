import React from "react";
import Heading from "../components/Heading.tsx";
import UserSection from "../components/Settings/UserSection.tsx";
import SiteSection from "../components/Settings/SiteSection.tsx";
import ApiSection from "../components/Settings/ApiSection.tsx";
import TeamsSection from "../components/Settings/TeamsSection.tsx";

function Settings() {
  return (
    <main>
      <Heading heading={"Settings"} />

      <div className="bg-white m-2 rounded-lg p-2">
        <UserSection />
        <SiteSection />
        <ApiSection />
        <TeamsSection />
      </div>
    </main>
  );
}

export default Settings;
