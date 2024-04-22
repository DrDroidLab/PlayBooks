export const extractLiteralValue = (v) => {
  if (v.long) {
    return v.long;
  } else if (v.string) {
    return v.string;
  } else if (v.double) {
    return v.double.toFixed(2);
  } else if (v.bool) {
    return v.bool.toString();
  } else {
    return "";
  }
};

export const getQueryRequestFilter = ({ columns, attrs, filters }) => {
  return {
    filter: {
      op: "AND",
      filters: filters || computedFilterQuery(columns, attrs),
    },
  };
};
export const getQueryRequest = ({ columns, attrs, filters }) => {
  return {
    query_request: {
      filter: {
        op: "AND",
        filters: filters || computedFilterQuery(columns, attrs),
      },
    },
  };
};

const handleIdPayload = (id_type, val_type, id) => {
  if (val_type === "ID") {
    return {
      type: id_type,
      [id_type.toLowerCase()]: id,
    };
  }
  if (val_type === "ID_ARRAY") {
    return id?.map((item) => ({
      long: item,
      type: "LONG",
    }));
  }
};

const computedFilterQuery = (columns = [], attrs = []) => {
  let list = [];
  if (columns.length > 0) {
    list = [
      ...list,
      ...columns.map((column) => ({
        lhs: {
          column_identifier: {
            name: column.name,
          },
        },
        op: column.op,
        rhs: {
          literal: {
            literal_type: column.val_type,
            [column.val_type.toLowerCase()]: column.id_type
              ? handleIdPayload(column.id_type, column.val_type, column.id)
              : column.id,
          },
        },
      })),
    ];
  }
  if (attrs.length > 0) {
    list = [
      ...list,
      ...attrs.map((attr) => ({
        lhs: {
          attribute_identifier: {
            name: attr.name,
            path: attr.path,
          },
        },
        op: attr.op,
        rhs: {
          literal: {
            literal_type: attr.literal_type,
            [attr.literal_type.toLowerCase()]: attr.value,
          },
        },
      })),
    ];
  }
  return list;
};

export const transformOptions = ({ options, type }) => {
  if (type === OPTIONS_TYPE.COLUMN) {
    return options.map((option) => ({
      name: option?.name,
      op: option.op || "",
      literal_type: option?.type,
      val_type: option?.val_type,
      id_type: option?.id_option?.type,
      id_options:
        option?.id_option?.long_options &&
        Object.entries(option?.id_option?.long_options)?.map((id_option) => ({
          id: id_option[0],
          label: id_option[1],
        })),
      id:
        option?.value || (option?.id_option?.type.includes("ARRAY") ? [] : ""),
      alias: option?.alias,
    }));
  }
  if (type === OPTIONS_TYPE.ATTRIBUTE) {
    return options.map((option) => ({
      name: option?.name,
      path: option?.path,
      op: option.op || "",
      literal_type: option?.type,
      value:
        option?.value || (option?.id_option?.type.includes("ARRAY") ? [] : ""),
      path_alias: option?.path_alias,
    }));
  }
};

export const OPTIONS_TYPE = {
  COLUMN: "column",
  ATTRIBUTE: "attribute",
};
///////////////////////////////////////

export const randomString = () => {
  return String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    "",
  );
};

const getRhsPayload = (type, rhs) => {
  if (type === "ID") {
    return {
      type: "LONG",
      long: rhs,
    };
  }
  if (type === "ID_ARRAY") {
    return rhs.map((value) => ({
      type: "LONG",
      long: value,
    }));
  }
  if (type.includes("ARRAY")) {
    if (!Array.isArray(rhs)) {
      return rhs?.split(",");
    }
  }
  return rhs;
};

const getTransformedFilters = (filters) =>
  filters?.map((filter) => {
    const { path, optionType, lhs, lhsType, op, rhs, rhsType, filters } =
      filter;
    if (filters) {
      return {
        op: op,
        filters: getTransformedFilters(filters),
      };
    }
    return {
      op: op,
      lhs: {
        [optionType]: {
          name: lhs,
          path: path,
          type: lhsType,
        },
      },
      rhs: {
        literal: {
          literal_type: rhsType,
          [rhsType.toLowerCase()]: getRhsPayload(rhsType, rhs),
        },
      },
    };
  });

export const transformToAPIPayload = (queryBuilderPayload) => {
  const { filters, op } = queryBuilderPayload;
  const transformedFilters = getTransformedFilters(filters);
  return {
    filter: {
      filters: transformedFilters,
      op: op,
    },
  };
};

const DEBOUNCE_DELAY = 500;

export const debounce = (fn, delay = DEBOUNCE_DELAY) => {
  let timeoutId;
  return (...args) => {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      fn.call(context, ...args);
    }, delay);
  };
};

export const getPercentage = ({ value, total, toFixed = 2 }) => {
  return ((100 * value) / total).toFixed(toFixed);
};
