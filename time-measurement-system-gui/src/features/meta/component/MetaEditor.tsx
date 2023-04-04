import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { packMetaData, parseMetaData } from "../types";
import { Form } from "react-bootstrap";

type MetaEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
};

const useInputHandler = (options: { defaultValue: string, onBlur?: () => void }) => {
  const [value, setValue] = useState(options.defaultValue);

  const onChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setValue(ev.currentTarget.value);
  };

  return [value, { value, onChange, onBlur: options.onBlur }] as const;
};

export default function MetaEditor({ value, onChange, onBlur }: MetaEditorProps) {
  const parsedInputValue = useMemo(() => {
    if (!value) {
      return null;
    }

    try {
      return parseMetaData(value);
    } catch (e) {
      return null;
    }
  }, [value]);

  const [carId, carIdInputHandler] = useInputHandler({
    defaultValue: parsedInputValue?.carId ?? "",
    onBlur
  });

  useEffect(() => {
    onChange && onChange(packMetaData({ carId }));
  }, [carId]);

  return (
    <>
      <Form.Group>
        <Form.Label htmlFor="">ゼッケンID</Form.Label>
        <Form.Control type="text" {...carIdInputHandler} />
      </Form.Group>
    </>
  );
}
