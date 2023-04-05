import { ReactNode } from "react";
import Barrier from "./Barrier";

type PageProps = {
  children?: ReactNode;
};

export default function Page({ children }: PageProps) {
  return <Barrier><div  data-beacon="beacon">{children}</div></Barrier>;
}
