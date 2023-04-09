import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, ReactElement, useState } from "react";
import { Overlay, OverlayTrigger, Popover, Tooltip } from "react-bootstrap";
import { useOnClickOutside } from "usehooks-ts";

type EditableValueProps = {
  value: string;
  validate?: (
    value: string
  ) => string | ReactElement | true | false | undefined;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  readonly?: boolean;
  children: (props: {
    children: ReactElement;
    onDoubleClick: () => void;
  }) => ReactElement;
};

export default function EditableValue({
  value,
  validate,
  onChange,
  children,
}: EditableValueProps) {
  const [dirtyValue, setDirtyValue] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | ReactElement | undefined>(
    undefined
  );

  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  const onInputRef = (ref: HTMLInputElement) => {
    ref?.focus();
    setInputRef(ref);
  };

  const onDoubleClick = () => {
    if (dirtyValue === undefined) {
      setDirtyValue(value);
    }
  };

  const onExit = () => {
    if (dirtyValue === undefined) {
      return;
    }

    if (validate) {
      const result = validate(dirtyValue);
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
      onChange(dirtyValue);
    }
    setDirtyValue(undefined);
  };

  const onInputChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setDirtyValue(ev.currentTarget.value);
    setError(undefined);
  };

  useOnClickOutside({ current: inputRef }, onExit);

  const child =
    dirtyValue === undefined ? (
      <>{value}</>
    ) : (
      <form
        style={{ display: "flex", alignItems: "center", gap: "4px" }}
        onSubmit={(ev) => {
          ev.preventDefault();
          onExit();
        }}
      >
        <input
          style={{
            display: "inline",
            outline: "none",
            textDecoration: error ? "red underline" : "none",
            border: "none",
            backgroundColor: "transparent",
            padding: "0",
            margin: "none",
            flex: "1 1",
            width: "0",
          }}
          ref={onInputRef}
          onBlur={onExit}
          value={dirtyValue}
          onChange={onInputChange}
          onKeyDown={(ev) => {
            if (ev.key === "Escape") {
              onExit();
            }
          }}
        />
        <OverlayTrigger
          placement="right"
          overlay={props => <Tooltip {...props}>この値を編集中です</Tooltip>}
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
