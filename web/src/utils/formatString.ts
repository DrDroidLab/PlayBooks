type FormatStringArgTypes = {
  str: string;
  startLength: number;
  endLength: number;
  maxLength: number;
};

export const formatString = ({
  str,
  startLength = 37,
  endLength = 20,
  maxLength = 50
}: FormatStringArgTypes): string => {
  if (str.length <= maxLength) {
    return str;
  }

  const first_part = str.slice(0, startLength);
  const last_part = str.slice(str.length - endLength, str.length);

  return first_part + '...' + last_part;
};
