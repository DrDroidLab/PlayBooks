import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setPlaybookKey,
} from "../store/features/playbook/playbookSlice.ts";

function usePlaybookKey(key: string) {
  const dispatch = useDispatch();
  const playbookData = useSelector(playbookSelector);

  const updateKeyValue = (value) => {
    dispatch(setPlaybookKey({ key, value }));
  };

  return [playbookData[key], updateKeyValue];
}

export default usePlaybookKey;
