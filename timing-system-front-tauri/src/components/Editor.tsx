import { useEffect, useState } from "react";

export default function ValueEditor(props: {
  currentValue: string;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<string>(props.currentValue);

  const onSubmit = () => {
    props.onChange(editingValue);
    setEditing(false);
  };

  if (editing) {
    return (
      <form onSubmit={onSubmit}>
        <span>{props.currentValue}→</span>
        <input value={editingValue} onChange={ev => setEditingValue(ev.currentTarget.value)} />
        <button>確定</button>
        <button onClick={() => setEditing(false)}>キャンセル</button>
      </form>
    );
  } else {
    return (
      <>
        {props.currentValue}
        <button
          onClick={() => {
            setEditingValue(props.currentValue);
            setEditing(true);
          }}
        >
          編集
        </button>
      </>
    );
  }
}
