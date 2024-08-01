export const defaultCodeTransformer = `def transform(context):
  out = {}
  for k in context.keys():
    out[k] = str(context[k]) + "-a"
  return out`;

export const exampleInputTransformer = `{
  "key1": "value1",
  "key2": "value2"
}`;
