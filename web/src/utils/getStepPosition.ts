import { Step } from "../types";

const parentIndexExists = (parentIndexes) => {
  return parentIndexes && parentIndexes?.length > 0;
};

const getSteps = (stepsList) => {
  const steps = JSON.parse(JSON.stringify(stepsList));
  const stepsWithParents = steps.filter((step) =>
    parentIndexExists(step.parentIndexes),
  );
  const stepsWithoutParents = steps.filter(
    (step) => !parentIndexExists(step.parentIndexes),
  );

  return {
    steps,
    stepsWithParents,
    stepsWithoutParents,
  };
};

export const getStepPosition = (step: Step, steps: Step[]) => {
  return {
    x: getX(step, steps),
    y: getY(step, steps),
  };
};

const getX = (step: Step, stepsList: Step[]) => {
  const { stepsWithParents, stepsWithoutParents } = getSteps(stepsList);
  if (stepsWithParents.find((e) => e.stepIndex === step.stepIndex)) {
    return (
      -(250 * (stepsWithParents.length / 2 + 1 / 2)) +
      250 * (step.stepIndex + 1)
    );
  }
  return (
    -(250 * (stepsWithoutParents.length / 2 + 1 / 2)) +
    250 * (step.stepIndex + 1)
  );
};

const getY = (step: Step, stepsList: Step[]) => {
  const { steps, stepsWithParents } = getSteps(stepsList);
  if (stepsWithParents.find((e) => e.stepIndex === step.stepIndex)) {
    let maxY = 0;
    let maxYStepIndex = 0;
    step.parentIndexes?.forEach((parentIndex) => {
      const currentParent = steps[parentIndex];
      if (currentParent.position?.y > maxY) {
        maxY = currentParent.y;
        maxYStepIndex = currentParent.stepIndex;
      }
    });

    return 300 + steps[maxYStepIndex]?.position?.y ?? 0;
  }
  return 300;
};
