import { Link } from "react-router-dom";

function ForgotPasswordBox() {
  return (
    <div className="flex items-center gap-1 text-sm justify-center">
      Forgot password?
      <Link className="text-violet-500 hover:underline" to="/reset-password">
        Reset
      </Link>
    </div>
  );
}

export default ForgotPasswordBox;
