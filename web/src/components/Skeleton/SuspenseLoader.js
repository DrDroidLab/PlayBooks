import * as React from 'react';

const SuspenseLoader = props => {
  const { loader, loading, children } = props;
  if (loading) return loader;
  return <>{children}</>;
};

export default SuspenseLoader;
