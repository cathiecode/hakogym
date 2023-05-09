import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  ReactElement,
  useState,
} from "react";
import { Overlay, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import { useOnClickOutside } from "usehooks-ts";
import classNames from "classnames/bind";

import styles from "./styles.module.css";

const cx = classNames.bind(styles);

type EditableValueProps = {
  value: string;
  readonly?: boolean;
  customInput?: (
    props: {
      className: string;
      ref: (item: HTMLElement | null) => void;
      value: string,
      onExit: (value?: string) => void;
      onChange: (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
      onBlur: (ev: FocusEvent<HTMLInputElement | HTMLSelectElement>) => void
      onKeyDown: (ev: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void
    }
  ) => ReactElement;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  validate?: (
    value: string
  ) => string | ReactElement | true | false | undefined;
  children: (props: {
    children: ReactElement | string;
    onDoubleClick: () => void;
  }) => ReactElement;
};

export default function EditableValue({
  value,
  readonly,
  validate,
  onChange,
  children,
  customInput,
}: EditableValueProps) {
  const [dirtyValue, setDirtyValue] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | ReactElement | undefined>(
    undefined
  );

  const [inputRef, setInputRef] = useState<HTMLElement | null>(null);

  const onInputRef = (ref: HTMLElement | null) => {
    ref?.focus();
    setInputRef(ref);
  };

  const onDoubleClick = () => {
    if (dirtyValue === undefined) {
      setDirtyValue(value);
    }
  };

  const onExit = (value?: string) => {
    const finalValue = value ?? dirtyValue;

    if (finalValue === undefined) {
      return;
    }

    if (validate) {
      const result = validate(finalValue);
      if (result === false) {
        setError("入力値が不正です");
        return;
      }

      if (result !== true && result !== undefined) {
        return setError(result);
      }

      setError(undefined);
    }

    if (onChange) {
      onChange(finalValue);
    }
    setDirtyValue(undefined);
  };

  const onInputChange = (ev: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDirtyValue(ev.currentTarget.value);
    setError(undefined);
  };

  const onInputKeydown = (ev: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (ev.key === "Escape") {
      onExit();
    }
  };

  useOnClickOutside({ current: inputRef }, () => onExit());

  const child =
    dirtyValue === undefined || readonly ? (
      value
    ) : (
      <form
        style={{ display: "flex", alignItems: "center", gap: "4px" }}
        onSubmit={(ev) => {
          ev.preventDefault();
          onExit();
        }}
      >
        {customInput ? (
          customInput({
            onExit: onExit,
            className: cx("input", { "input--error": !!error }),
            ref: onInputRef,
            onBlur: () => onExit(),
            value: dirtyValue,
            onChange: onInputChange,
            onKeyDown: onInputKeydown,
          })
        ) : (
          <input
          className={cx("input", { "input--error": !!error })}
            ref={onInputRef}
            onBlur={() => onExit()}
            value={dirtyValue}
            onChange={onInputChange}
            onKeyDown={onInputKeydown}
          />
        )}
        <OverlayTrigger
          placement="right"
          overlay={(props) => <Tooltip {...props}>この値を編集中です</Tooltip>}
        >
          {({ ref, ...props }) => (
            <div {...props}>
              <FontAwesomeIcon color="#ccc" icon={faPenToSquare} ref={ref} />
            </div>
          )}
        </OverlayTrigger>
        <Overlay target={inputRef} show={!!error} placement="left">
          {(options) => (
            <Popover {...options}>
              <Popover.Body>{error}</Popover.Body>
            </Popover>
          )}
        </Overlay>
      </form>
    );
  return children({ onDoubleClick, children: child });
}
