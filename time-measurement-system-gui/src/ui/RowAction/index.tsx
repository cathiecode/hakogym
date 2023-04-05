import classnames from "classnames/bind";

import styles from "./styles.module.css";
import { ReactNode, useState } from "react";


type RowActionProps = {
  onInsertBefore?: () => void;
  onInsertAfter?: () => void;
  children?: ReactNode;
};

const cx = classnames.bind(styles);

export default function RowAction(props: RowActionProps) {
  const [showing, setShowing] = useState(false);

  return (
    <div className={cx("RowAction")}>
      <button className={cx("insertButton", "insertButton--before")}>+</button>
      <div>{props.children}</div>
      <button className={cx("insertButton", "insertButton--after")}>+</button>
    </div>
  );
}
