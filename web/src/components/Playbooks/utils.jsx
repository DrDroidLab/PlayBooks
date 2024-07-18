export const getTSLabel = (labelObj) => {
  return labelObj.map((x) => `${x.name}:${x.value}`).join(" | ");
};
