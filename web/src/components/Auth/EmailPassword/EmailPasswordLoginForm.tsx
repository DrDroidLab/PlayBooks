import { CircularProgress } from "@mui/material";
import { useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../../store/features/auth/api/loginApi.ts";
import { Toast } from "../../Toast.tsx";
import CustomInput from "../../Inputs/CustomInput.tsx";
import { InputTypes } from "../../../types/inputs/inputTypes.ts";
import ShowPasswordIcon from "./ShowPasswordIcon.tsx";

function EmailPasswordLoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [triggerLogin, { isLoading }] = useLoginMutation();
  const from = location.state?.from?.pathname || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleOpenToast = (msg: string, toastType: string) => {
    setToastMsg(msg);
    setToastType(toastType);
    setToastOpen(true);
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  const validate = () => {
    const newErrors = structuredClone(errors);
    if (!email) {
      newErrors.email = "Email is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).every((key) => !newErrors[key]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const data = {
        email: email,
        password: password,
      };
      await triggerLogin(data).unwrap();
      setEmail("");
      setPassword("");
      handleOpenToast("Login Successful!", "success");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      let error = "Login Failed";
      if (!err) {
        error = "No Server Response";
      } else if ((err as any)?.status === 400) {
        error =
          (err as any).data?.non_field_errors?.[0] ??
          (err as any).data?.[Object.keys((err as any)?.data ?? {})?.[0]];
      } else if ((err as any)?.status === 401) {
        error = "Unauthorized";
      }
      handleOpenToast(error, "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2 my-2 w-full">
        <CustomInput
          inputType={InputTypes.TEXT}
          disabled={isLoading}
          value={email}
          handleChange={setEmail}
          placeholder="Enter Email"
          className="!w-full"
          containerClassName="!w-full"
          error={errors.email}
        />
        <CustomInput
          inputType={InputTypes.TEXT}
          disabled={isLoading}
          type={showPassword ? "text" : "password"}
          value={password}
          handleChange={setPassword}
          placeholder="Enter Password"
          className="!w-full border-none"
          containerClassName={`!w-full border rounded p-1 ${
            errors.password ? "border-red-500" : ""
          }`}
          error={errors.password}
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
        {isLoading ? (
          <CircularProgress style={{ color: "inherit !important" }} size={20} />
        ) : (
          "Login"
        )}
      </CustomButton>

      <Toast
        open={toastOpen}
        handleClose={handleCloseToast}
        message={toastMsg}
        severity={toastType}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </form>
  );
}

export default EmailPasswordLoginForm;
