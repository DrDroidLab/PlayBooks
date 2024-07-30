import { RemoveRedEyeRounded } from "@mui/icons-material";

type ShowPasswordIconPropTypes = {
  togglePasswordVisibility: (
    e?: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;
};

function ShowPasswordIcon({
  togglePasswordVisibility,
}: ShowPasswordIconPropTypes) {
  return (
    <div className="cursor-pointer" onClick={togglePasswordVisibility}>
      <RemoveRedEyeRounded
        className="hover:text-black text-gray-700"
        fontSize="small"
      />
    </div>
  );
}

export default ShowPasswordIcon;
