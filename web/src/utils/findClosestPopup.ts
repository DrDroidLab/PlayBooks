export const findClosestPopup = (element) => {
  if (!element) return null;
  return (
    element.closest(`[data-testid="picker-popup"]`) ||
    element.querySelector(`[data-testid="picker-popup"]`)
  );
};
