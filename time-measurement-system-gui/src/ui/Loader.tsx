import { ReactElement, ReactNode } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import Loading from "./Loading";

type LoaderProps<T, E> = {
  data?: T;
  error?: E;
  children: (data: T) => ReactElement | ReactElement[];
  errorRender?: ReactElement | ((error: E) => ReactElement);
  loadingRender?: ReactElement | (() => ReactElement);
};

export default function Loader<T, E>({
  data,
  error,
  children,
  loadingRender,
  errorRender,
}: LoaderProps<T, E>) {
  if (error) {
    if (errorRender) {
      if (typeof errorRender === "function") {
        return errorRender(error);
      } else {
        return errorRender;
      }
    } else {
      return (
        <Alert variant="danger">
          データのロードに失敗しました。(e: {error.toString()})
          <Button
            onClick={() => {
              location.reload();
            }}
          >
            再読み込み
          </Button>
        </Alert>
      );
    }
  }

  if (data) {
    return <>{children(data)}</>;
  }

  if (loadingRender) {
    if (typeof loadingRender === "function") {
      return loadingRender();
    } else {
      return loadingRender;
    }
  }

  return <Loading />;
}
