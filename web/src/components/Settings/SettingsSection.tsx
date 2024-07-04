import React from "react";
import Info from "./Info.tsx";
import SettingsTitle from "./SettingsTitle.tsx";

type Section = {
  label: string;
  value: string;
};

type SettingsSectionPropTypes = {
  title: string;
  sections?: Section[];
};

function SettingsSection({ title, sections }: SettingsSectionPropTypes) {
  return (
    <section className="border-b pb-4 mb-4">
      <SettingsTitle title={title} />
      <div className="mt-2 flex flex-col gap-2">
        {sections?.map(({ label, value }, index) => (
          <Info key={index} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

export default SettingsSection;
