import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PaginationKeys,
  paginationSelector,
  setPaginationKey,
} from "../store/features/pagination/paginationSlice.ts";

interface UsePaginationResult {
  page: number;
  limit: number;
  handleChangePage: (event: any, newPage: number) => void;
  handleChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
}

const usePagination = (): UsePaginationResult => {
  const dispatch = useDispatch();
  const pagination = useSelector(paginationSelector);

  const { page, limit } = pagination;

  const handleChangePage = useCallback(
    (event, newPage) => {
      dispatch(setPaginationKey({ key: PaginationKeys.PAGE, value: newPage }));
    },
    [dispatch],
  );

  const handleChangeRowsPerPage = useCallback(
    (event) => {
      let newPageSize = parseInt(event.target.value, 10);
      dispatch(
        setPaginationKey({ key: PaginationKeys.LIMIT, value: newPageSize }),
      );
      dispatch(setPaginationKey({ key: PaginationKeys.PAGE, value: 0 }));
    },
    [dispatch],
  );

  return {
    page,
    limit,
    handleChangePage,
    handleChangeRowsPerPage,
  };
};

export default usePagination;
