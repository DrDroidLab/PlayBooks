import Heading from "../../components/Heading";
import { useState } from "react";
import useDebounce from "../../hooks/common/useDebounce";
import { useGetSecretsListQuery } from "../../store/features/secrets/api";
import usePaginationComponent from "../../hooks/common/usePaginationComponent";
import CustomInput from "../../components/Inputs/CustomInput";
import { InputTypes } from "../../types";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader";
import TableSkeleton from "../../components/Skeleton/TableLoader";
import PaginatedTable from "../../components/common/Table/PaginatedTable";
import { secretsColumns } from "./utils";
import { useSecretsData } from "./hooks";
import CreateSecretButton from "../../components/secret-management/create/CreateSecretButton";
import SecretCreateOverlay from "../../components/secret-management/create/SecretCreateOverlay";
import SecretActionOverlay from "../../components/secret-management/SecretActionOverlay";

function SecretManagement() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const { data, isFetching, refetch } = useGetSecretsListQuery({
    key: debouncedQuery,
  });
  const secretsList = data?.secrets ?? [];
  const total = data?.meta?.total_count ?? 0;
  const {
    rows,
    actions,
    isActionOpen,
    selectedSecret,
    toggle,
    isConfigOpen,
    toggleConfig,
    selectedId,
  } = useSecretsData(secretsList ?? []);
  usePaginationComponent(refetch);

  return (
    <>
      <Heading heading={"All Variables"} />
      <main className="flex flex-col gap-4 p-2 pt-4">
        <div className="flex items-center gap-2">
          <CreateSecretButton />
        </div>
        <CustomInput
          inputType={InputTypes.SEARCH}
          type="search"
          value={query}
          handleChange={setQuery}
          containerClassName="!w-full"
          placeholder="Search secrets..."
        />
        <SuspenseLoader loading={isFetching} fallback={<TableSkeleton />}>
          <PaginatedTable
            columns={secretsColumns}
            data={rows}
            total={total}
            actions={actions}
          />
        </SuspenseLoader>
      </main>

      {isActionOpen && (
        <SecretActionOverlay
          secret={selectedSecret}
          isOpen={isActionOpen}
          toggleOverlay={toggle}
          refreshTable={refetch}
        />
      )}
      {isConfigOpen && (
        <SecretCreateOverlay
          isOpen={isConfigOpen}
          toggleOverlay={toggleConfig}
          id={selectedId}
        />
      )}
    </>
  );
}

export default SecretManagement;
