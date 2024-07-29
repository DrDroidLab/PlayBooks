export const findClosestPopup = (element: any) => {
  if (!element) return null;
  return (
    element.closest(`[data-testid="picker-popup"]`) ||
    element.querySelector(`[data-testid="picker-popup"]`)
  );
};
