import { store } from "../store/index.ts";
import { setKey } from "../store/features/integrations/integrationsSlice.ts";

export default function handleDefaultValues(data) {
  const keyType = data.key_type;
  switch (keyType) {
    case "SSL_VERIFY":
      store.dispatch(setKey({ key: data.key_type, value: true }));
      break;
    default:
      return;
  }
}
