import { useAtom, useSetAtom } from "jotai";
import { ReactNode, useCallback } from "react"
import { confirmationAtom } from "../store";

export default function ButtonWithConfirmation(props: {todo: string, onSubmit: () => void, children: ReactNode}) {
    const setConfirmation = useSetAtom(confirmationAtom);

    const onClick = useCallback(() => {
        setConfirmation({
            message: props.todo,
            onSubmit: props.onSubmit
        });
    }, [props.todo, props.onSubmit]);

    return <button onClick={onClick}>{props.children}</button>
}