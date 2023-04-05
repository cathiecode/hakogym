import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { defaultMetaData, packMetaData, parseMetaData } from "../types";
import { Form } from "react-bootstrap";

type MetaEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
};

function useInputHandler(
  id: string,
  options?: {
    defaultValue?: string;
    onChange?: (id: string, value: string) => void;
    onBlur?: () => void;
  }
) {
  const [value, setValue] = useState(options?.defaultValue ?? "");
  const ref = useRef<HTMLInputElement>(null);
  const onChange = (ev: ChangeEvent<HTMLInputElement>) => {
    console.log("change", ev.currentTarget.value);

    setValue(ev.currentTarget.value);

    if (!options?.onChange) {
      return;
    }

    options?.onChange(id, ev.currentTarget.value);
  };

  return [value, { value, onChange, onBlur: options?.onBlur, ref }] as const;
}

export default function MetaEditor({
  value,
  onBlur,
  onChange,
}: MetaEditorProps) {
  const parsedInputData = useMemo(() => {
    if (!value) {
      return null;
    }
    try {
      return parseMetaData(value);
    } catch (e) {
      console.error("failed to parse metadata!");
      return null;
    }
  }, [value]);
  const defaultValues = useMemo(() => {
    if (!parsedInputData) {
      return {
        carId: "",
        pylonTouchCount: "0",
        derailmentCount: "0",
      };
    }

    return {
      carId: parsedInputData.carId,
      pylonTouchCount: parsedInputData.pylonTouchCount.toString(10),
      derailmentCount: parsedInputData.derailmentCount.toString(10),
    };
  }, [parsedInputData]);

  const [carId, carIdProps] = useInputHandler("carId", {
    defaultValue: defaultValues.carId,
    onBlur,
  });
  const [pylonTouchCount, pylonTouchCountProps] = useInputHandler(
    "pylonTouchCount",
    { defaultValue: defaultValues.pylonTouchCount, onBlur }
  );
  const [derailmentCount, derailmentCountProps] = useInputHandler(
    "derailmentCount",
    { defaultValue: defaultValues.derailmentCount, onBlur }
  );

  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {}
  );

  useEffect(() => {
    const errors = {
      carId: [] as string[],
      pylonTouchCount: [] as string[],
      derailmentCount: [] as string[],
    };
    const mayValidValue = {
      carId,
      pylonTouchCount: Number(pylonTouchCount),
      derailmentCount: Number(derailmentCount),
    };

    if (isNaN(mayValidValue.pylonTouchCount)) {
      errors.pylonTouchCount.push("数値を入力してください");
    }
    if (isNaN(mayValidValue.derailmentCount)) {
      errors.derailmentCount.push("数値を入力してください");
    }

    setErrors(errors);

    if (Object.values(errors).every((valueError) => valueError.length === 0)) {
      // TODO: 全部の値を入れる
      onChange &&
        onChange(
          packMetaData({
            ...parseMetaData(defaultMetaData()),
            ...parsedInputData,
            ...mayValidValue,
          })
        );
    } else {
      onChange && onChange("");
    }
  }, [carId, pylonTouchCount, derailmentCount, onChange, parsedInputData]);

  console.log("rerender");

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>ゼッケン番号</Form.Label>
        <Form.Control type="text" {...carIdProps} />
        <Form.Control.Feedback>{errors.carIdProps}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>パイロンタッチ</Form.Label>
        <Form.Control type="number" {...pylonTouchCountProps} />
        <Form.Control.Feedback>{errors.pylonTouchCount}</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>脱輪</Form.Label>
        <Form.Control type="number" {...derailmentCountProps} />
        <Form.Control.Feedback>{errors.derailmentCount}</Form.Control.Feedback>
      </Form.Group>
    </>
  );
}
