import { ReactNode } from "react";
import { Alert, Button } from "react-bootstrap";
import { ErrorBoundary } from "react-error-boundary";

type BarrierProps = {
  altControl?: ReactNode;
  children: ReactNode;
};

export default function Barrier(props: BarrierProps) {
  return (
    <ErrorBoundary
      onError={(error, info) => console.error("Caught error", error, info)}
      fallback={
        <Alert variant="Error">
          エラーが発生しました。
          <Button onClick={() => location.reload()}>再起動</Button>
          {props.altControl ? (
            <ErrorBoundary fallback={null}>{props.altControl}</ErrorBoundary>
          ) : null}
        </Alert>
      }
    >
      {props.children}
    </ErrorBoundary>
  );
}
