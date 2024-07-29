import { useDispatch, useSelector } from "react-redux";
import {
  PaginationKeys,
  paginationSelector,
  resetPagination,
} from "../../store/features/pagination/paginationSlice.ts";
import { useEffect } from "react";

function usePaginationComponent(refetch: () => void) {
  const dispatch = useDispatch();
  const pagination = useSelector(paginationSelector);
  const page = pagination[PaginationKeys.PAGE];
  const limit = pagination[PaginationKeys.LIMIT];

  useEffect(() => {
    if (refetch) refetch();
  }, [page, limit, refetch]);

  useEffect(() => {
    return () => {
      dispatch(resetPagination());
    };
  }, [dispatch]);
}

export default usePaginationComponent;
