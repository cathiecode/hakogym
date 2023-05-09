import { ReactNode } from "react";
import Barrier from "./Barrier";

type PageProps = {
  children?: ReactNode;
};

export default function Page({ children }: PageProps) {
  return <Barrier>{children}</Barrier>;
}
