import { useDispatch, useSelector } from "react-redux";
import {
  fakeLoadingSelector,
  startFakeLoading,
  stopFakeLoading,
} from "../../store/features/fakeLoading/fakeLoadingSlice";

const FAKE_LOADING_DELAY = 500;

function useFakeLoading(title?: string) {
  const dispatch = useDispatch();
  const isLoading = useSelector(fakeLoadingSelector);

  const triggerLoading = () => {
    dispatch(startFakeLoading(title));
    setTimeout(() => {
      dispatch(stopFakeLoading());
    }, FAKE_LOADING_DELAY);
  };

  return {
    isLoading,
    triggerLoading,
    title,
  };
}

export default useFakeLoading;
