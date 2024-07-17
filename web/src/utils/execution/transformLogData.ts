export default function transformLogData(data: any) {
  const result = {};

  data.columns.forEach((column: any) => {
    if (column.name === "@message") {
      try {
        result[column.name] = JSON.parse(column.value);
      } catch (e) {
        console.error("Failed to parse @message JSON", e);
        result[column.name] = column.value;
      }
    } else {
      result[column.name] = column.value;
    }
  });

  return result;
}
