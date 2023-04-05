import { useMemo } from "react";
import { parseMetaData } from "../types";
import { ErrorBoundary } from "react-error-boundary";

type MetaCellsProps = {
  value: string;
};

function MetaCellsInner(props: MetaCellsProps) {
  const value = useMemo(() => parseMetaData(props.value), [props.value]);

  return (
    <>
      <td>{value.carId}</td>
      <td>{value.pylonTouchCount}</td>
      <td>{value.derailmentCount}</td>
    </>
  );
}

function MetaCellsFallback() {
  return (
    <>
      <td>Metadata Error</td>
    </>
  );
}

export default function MetaCells(props: MetaCellsProps) {
  return (
    <ErrorBoundary fallback={<MetaCellsFallback />}>
      <MetaCellsInner {...props} />
    </ErrorBoundary>
  );
}
