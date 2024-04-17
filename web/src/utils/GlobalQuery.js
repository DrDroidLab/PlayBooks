import data from '../../src/data.json';

export const getGlobalQueryOptionsDesc = () => {
  return data.global_query_options.op_descriptions.map(desc => ({
    id: desc.op,
    label: desc.label
  }));
};

export const getOparationMapping = () => {
  const mappingArr = data.global_query_options?.op_mapping;
  return mappingArr?.reduce((acc, item) => {
    return {
      ...acc,
      [item.lhs]: item?.op_rhs?.map(operation => operation?.op)
    };
  }, {});
};

export const getValueType = (lhs, op) => {
  const mappingArr = data.global_query_options?.op_mapping;
  const mappingArrItem = mappingArr.find(item => item.lhs === lhs);
  return mappingArrItem.op_rhs.find(item => item.op === op).rhs;
};

export const operatorDescriptonMapping = () => {
  const mappingArr = data.global_query_options?.op_descriptions;
  return mappingArr?.reduce((acc, item) => {
    return {
      ...acc,
      [item.op]: {
        label: item.label,
        is_unary: item.is_unary,
        is_logical: item.is_logical
      }
    };
  }, {});
};

export const getOperatorOptions = lhs => {
  const mappingArr = data.global_query_options?.op_mapping;
  const mappingArrItem = mappingArr.find(item => item.lhs === lhs);
  return mappingArrItem.op_rhs.map(item => ({
    id: item.op,
    label: operatorDescriptonMapping()[item.op].label,
    is_unary: operatorDescriptonMapping()[item.op].is_unary,
    is_logical: operatorDescriptonMapping()[item.op].is_logical
  }));
};

export const groupOptions = () => {
  const mappingArr = data.global_query_options?.op_descriptions;
  return mappingArr?.reduce((acc, item) => {
    if (!!item.is_logical) {
      return [
        ...acc,
        {
          id: item.op,
          label: item.label
        }
      ];
    }
    return acc;
  }, []);
};
