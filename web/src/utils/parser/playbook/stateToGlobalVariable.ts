export default function stateToGlobalVariable(globalVariables) {
  return globalVariables?.reduce((acc, curr) => {
    acc[curr.name] = curr.value;
    return acc;
  }, {});
}
