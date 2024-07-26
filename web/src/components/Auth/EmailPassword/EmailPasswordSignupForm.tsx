import { CircularProgress } from "@mui/material";
import { useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Toast } from "../../Toast.jsx";
import { useNavigate } from "react-router-dom";
import {
  useLazySaveSiteUrlQuery,
  useSignupMutation,
} from "../../../store/features/auth/api/index.ts";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import ShowPasswordIcon from "./ShowPasswordIcon.tsx";

function EmailPasswordSignupForm() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [triggerSignup, { isLoading }] = useSignupMutation();
  const [triggerSiteUrlSave] = useLazySaveSiteUrlQuery();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseToast = () => {
    setError("");
  };

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function redirectToLoginAfterSignup() {
    navigate("/login");
  }

  const getError = (err) => {
    const errObj = err?.data;
    if (errObj && Object.keys(errObj).length !== 0) {
      if (errObj.email) return errObj.email[0];
      if (!errObj.email && errObj.password) return errObj.password[0];
      if (!errObj.email && !errObj.password && errObj.non_field_errors)
        return errObj.non_field_errors[0];

      return "Something went wrong!!";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setBtnLoading(true);
    try {
      const data = {
        email: email,
        firstName,
        lastName,
        password: password,
      };
      await triggerSignup(data).unwrap();
      await triggerSiteUrlSave({ siteUrl: window.location.origin }).unwrap();

      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");

      redirectToLoginAfterSignup();
    } catch (err) {
      console.error(err);
      setBtnLoading(false);
      const error = getError(err);
      setError(error);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2 my-2">
          <div className="flex gap-2">
            <CustomInput
              id="firstname"
              inputType={InputTypes.TEXT}
              disabled={isLoading}
              value={firstName}
              handleChange={setFirstName}
              placeholder="Enter First Name"
              className="!w-full"
              containerClassName="!w-full"
            />
            <CustomInput
              id="lastname"
              inputType={InputTypes.TEXT}
              disabled={isLoading}
              value={lastName}
              handleChange={setLastName}
              placeholder="Enter Last Name"
              className="!w-full"
              containerClassName="!w-full"
            />
          </div>

          <CustomInput
            inputType={InputTypes.TEXT}
            disabled={isLoading}
            value={email}
            handleChange={setEmail}
            placeholder="Enter Email"
            className="!w-full"
            containerClassName="!w-full"
          />

          <CustomInput
            inputType={InputTypes.TEXT}
            disabled={isLoading}
            type={showPassword ? "text" : "password"}
            value={password}
            handleChange={setPassword}
            placeholder="Enter Password"
            className="!w-full border-none"
            containerClassName={`!w-full border rounded p-1`}
            suffix={
              password && (
                <ShowPasswordIcon
                  togglePasswordVisibility={togglePasswordVisibility}
                />
              )
            }
          />
        </div>

        <CustomButton
          className="!bg-violet-500 !text-white !text-sm w-full !justify-center hover:!bg-transparent hover:!text-violet-500 p-2 font-normal"
          onClick={handleSubmit}>
          {btnLoading ? (
            <CircularProgress style={{ color: "inherit !important" }} />
          ) : (
            "Sign up"
          )}
        </CustomButton>
      </form>

      <Toast
        open={!!error}
        severity="error"
        message={error}
        handleClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </div>
  );
}

export default EmailPasswordSignupForm;
