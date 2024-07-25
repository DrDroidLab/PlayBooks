import React from "react";
import EmailInputComponent from "./EmailInputComponent.tsx";

function SmtpEmail() {
  return (
    <div className="my-2 flex flex-col gap-2">
      <EmailInputComponent
        label="To"
        val="to_email"
        placeholder="Enter email address"
      />
      <EmailInputComponent
        label="Subject"
        val="subject"
        placeholder="Enter subject"
      />
    </div>
  );
}

export default SmtpEmail;
