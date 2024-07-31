import { DatePicker } from "rsuite";
import { isAfter } from "rsuite/esm/internals/utils/date";

type DateInputTypes = {
  value: string;
  handleChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  format?: string;
  disabledDate?: (date: Date) => boolean;
};

function DateInput({
  value,
  error,
  handleChange,
  disabled,
  className,
  format = "dd/MM/yyyy hh:mm:ss aa",
  disabledDate: disabledDateFromProps,
}: DateInputTypes) {
  const onChange = (d: Date) => {
    const dateInSeconds = d.getTime() / 1000;
    handleChange(dateInSeconds.toString());
  };

  let disabledDate =
    disabledDateFromProps !== undefined
      ? disabledDateFromProps
      : (date: Date) => isAfter(date, new Date());

  return (
    <DatePicker
      format={format}
      disabled={disabled}
      onChangeCalendarDate={onChange}
      showMeridian
      cleanable={false}
      shouldDisableDate={disabledDate}
      value={
        typeof value === "string" || typeof value === "number"
          ? new Date(parseInt(value.toString(), 10) * 1000)
          : value
      }
      className={`${className} ${
        error ? "border-red-500" : ""
      } !text-violet-500 !w-full !rounded !border min-w-[220px] hover:!border-violet-500`}
      menuClassName="!z-[90] text-violet-500 bg-violet-500 !rounded"
    />
  );
}

export default DateInput;
