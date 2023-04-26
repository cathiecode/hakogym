import { ReactElement, useMemo } from "react";
import { ParsedMetaData, packMetaData, parseMetaData } from "../../types";
import { ErrorBoundary } from "react-error-boundary";
import EditableValue from "../../../../ui/EditableValue";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { Alert } from "react-bootstrap";
import JointMetaCell from "../JointMetaCell";

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
        readonly={!props.onChange}
      >
        {({ children, ...props }) => (
          <td {...props}>
            {children === "" ? (
              <span style={{ color: "#aaa" }}>(ゼッケンなし)</span>
            ) : (
              children
            )}
          </td>
        )}
      </EditableValue>
      <EditableValue
        value={value.heat}
        onChange={(newValue) => change({ ...value, heat: newValue })}
        readonly={!props.onChange}
      >
        {(props) => <td {...props} />}
      </EditableValue>
      <EditableValue
        value={value.pylonTouchCount.toString(10)}
        onChange={(newValue) =>
          change({ ...value, pylonTouchCount: Number(newValue) })
        }
        validate={(value) =>
          !isNaN(Number(value)) || <Error>数値を入力してください</Error>
        }
        readonly={!props.onChange}
      >
        {(props) => <td {...props} />}
      </EditableValue>
      <EditableValue
        value={value.derailmentCount.toString(10)}
        onChange={(newValue) =>
          change({ ...value, derailmentCount: Number(newValue) })
        }
        validate={(value) =>
          !isNaN(Number(value)) || <Error>数値を入力してください</Error>
        }
        readonly={!props.onChange}
      >
        {(props) => <td {...props} />}
      </EditableValue>
      <EditableValue
        value={value.status ?? ""}
        onChange={(newValue) =>
          change({
            ...value,
            status: (newValue as "" | "MC" | "DNF" | "DNS") || undefined,
          })
        }
        validate={(value) =>
          ["", "MC", "DNF", "DNS"].includes(value) ||
          "値はMC、DNF、DNSのいずれかあるいは空である必要があります"
        }
        customInput={({ ref, onExit, ...props }) => (
          <select
            ref={ref}
            {...props}
            onChange={(ev) => {
              onExit(ev.currentTarget.value);
            }}
          >
            <option value="">記録</option>
            <option value="MC">MC</option>
            <option value="DNF">DNF</option>
            <option value="DNS">DNS</option>
          </select>
        )}
        readonly={!props.onChange}
      >
        {(props) => <td {...props} />}
      </EditableValue>
    </>
  );
}

function MetaCellsFallback() {
  return (
    <>
      <JointMetaCell>Metadata Error</JointMetaCell>
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
