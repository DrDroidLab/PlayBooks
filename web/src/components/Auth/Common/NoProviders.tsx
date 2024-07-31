import { useGetLoginProvidersQuery } from "../../../store/features/auth/api/index.ts";

function NoProviders() {
  const { data, isLoading } = useGetLoginProvidersQuery();

  if (data?.length > 0 && !isLoading) return;

  return (
    <p className="text-sm text-center">
      No login providers are available. Please contact your system
      administrator.
    </p>
  );
}

export default NoProviders;
