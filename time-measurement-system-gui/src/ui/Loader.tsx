import { ReactNode } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";

type LoaderProps<T, E> = {
  isValidating?: boolean;
  data?: T;
  error?: E;
  onReload?: () => void;
  children: (data: NonNullable<T>) => ReactNode;
};

export default function Loader<T, E>({
  isValidating,
  data,
  error,
  onReload,
  children,
}: LoaderProps<T, E>) {
  if (error) {
    return (
      <Alert variant="danger">
        データのロードに失敗しました。(e: {error.toString()})
        <Button onClick={onReload ?? (() => {location.reload()})}>再読み込み</Button>
      </Alert>
    );
  }

  if (data) {
    return (
      <div style={{ position: "relative" }}>
        {children(data)}
        <div style={{ position: "absolute", right: 0, top: 0 }}>
          {isValidating ? (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">読み込み中</span>
            </Spinner>
          ) : null}
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">読み込み中</span>
        </Spinner>
      </div>
    );
  }
}
