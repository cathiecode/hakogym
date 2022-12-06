import { ReactNode, Suspense } from "react";

type LoaderProps<T> = {
  data: T | undefined | null;
  children: (data: T) => ReactNode;
};

export default function Loader<T>(props: LoaderProps<T>) {
  if (props.data) {
    return (
      <div>
        <Suspense fallback={<div>エラーが発生しました。<button onClick={() => window.location.reload()}>画面を再読込</button></div>}>
          {props.children(props.data)}
        </Suspense>
      </div>
    );
  }

  return <div>N/A</div>;
}
