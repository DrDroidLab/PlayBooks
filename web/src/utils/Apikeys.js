export const MaskCharacter = (str, mask, n = 1) => {
  return ('' + str).slice(0, -n).replace(/./g, mask) + ('' + str).slice(-n);
};
