import React from "react";
import SettingsSection from "./SettingsSection.tsx";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/features/auth/authSlice.ts";

function UserSection() {
  const user = useSelector(selectCurrentUser);

  return (
    <SettingsSection
      title="Profile"
      sections={[
        {
          label: "Name",
          value: `${user?.first_name} ${user?.last_name}`,
        },
        {
          label: "Email",
          value: user?.email,
        },
      ]}
    />
  );
}

export default UserSection;
