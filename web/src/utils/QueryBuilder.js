export const validatePayload = queryBuilderPayload => {
  const { op, lhs, rhs, rhsType, filters } = queryBuilderPayload;
  if (filters && filters.length === 0) {
    return null;
  }
  if (filters && filters.length > 0) {
    for (let i = 0; i < filters.length; i++) {
      const error = validatePayload(filters[i]);
      if (error) {
        return error;
      }
    }
  } else {
    if (!lhs) {
      return `Please select key of the rule`;
    }
    if (!op) {
      return `Please select operator of the rule`;
    }
    if (!rhs && !['NULL_NUMBER', 'NULL_STRING'].includes(rhsType) && rhs !== false) {
      return `Please fill or select value/values of the rule`;
    }
  }
  return null;
};
