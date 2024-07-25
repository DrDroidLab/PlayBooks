import { Connection } from "reactflow";
import { extractSource } from "../../../../utils/extractData.ts";
import { store } from "../../../../store/index.ts";
import { addRelation } from "../../../../store/features/playbook/playbookSlice.ts";

function handleConnection(connection: Connection) {
  if (!connection.source || !connection.target) return;
  const source = extractSource(connection.source);
  const target = extractSource(connection.target);

  store.dispatch(addRelation({ source, target }));
}

export default handleConnection;
