import { ReactNode } from "react"

type JointMetaCellProps = {
    extendCol?: number
    extendRow?: number
    children?: ReactNode
}

export default function JointMetaCell(props: JointMetaCellProps) {
    return <td colSpan={4 + (props.extendCol ?? 0)}>{props.children}</td>
}
