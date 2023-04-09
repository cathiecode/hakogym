import { ReactElement, useCallback, useMemo } from "react";
import { ParsedMetaData, packMetaData, parseMetaData } from "../../types";
import { ErrorBoundary } from "react-error-boundary";
import EditableValue from "../../../../ui/EditableCell";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.css";

import classNames from "classnames/bind";
import { Alert } from "react-bootstrap";

const cx = classNames.bind(styles);

function Error(props: { children: ReactElement | string }) {
  return (
    <div>
      <Alert variant="danger">
        <FontAwesomeIcon
          style={{ marginRight: "0.5em" }}
          icon={faTriangleExclamation}
        />
        {props.children}
      </Alert>
      <Alert variant="info">
        <FontAwesomeIcon style={{ marginRight: "0.5em" }} icon={faCircleInfo} />
        値はまだ更新されていません
      </Alert>
    </div>
  );
}

type MetaCellsProps = {
  value: string;
  onChange?: (value: string) => void;
};

function MetaCellsInner(props: MetaCellsProps) {
  const value = useMemo(() => parseMetaData(props.value), [props.value]);

  const change = (newMetadata: ParsedMetaData) => {
    props.onChange && props.onChange(packMetaData(newMetadata));
  };

  return (
    <>
      <EditableValue
        value={value.carId}
        onChange={(newValue) => change({ ...value, carId: newValue })}
      >
        {(props) => <td {...props} />}
      </EditableValue>
      <EditableValue
        value={value.pylonTouchCount.toString(10)}
        onChange={(newValue) => change({...value, pylonTouchCount: Number(newValue)})}
        validate={(value) =>
          !isNaN(Number(value)) || <Error>数値を入力してください</Error>
        }
      >
        {(props) => <td {...props} />}
      </EditableValue>
      <EditableValue
        value={value.derailmentCount.toString(10)}
        onChange={(newValue) => change({...value, derailmentCount: Number(newValue)})}
        validate={(value) =>
          !isNaN(Number(value)) || <Error>数値を入力してください</Error>
        }
      >
        {(props) => <td {...props} />}
      </EditableValue>
      <td>{value.status || "--"}</td>
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
