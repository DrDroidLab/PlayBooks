import { CloseRounded } from "@mui/icons-material";

type ChipProps = {
  item: string;
  handleClick: () => void;
};

function Chip({ item, handleClick }: ChipProps) {
  return (
    <div key={item} className="flex gap-1 bg-gray-200 p-1 rounded items-center">
      <p className="text-xs">{item}</p>
      <CloseRounded
        className="cursor-pointer"
        fontSize="small"
        onClick={handleClick}
      />
    </div>
  );
}

export default Chip;
