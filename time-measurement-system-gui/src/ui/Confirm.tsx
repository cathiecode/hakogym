import { ReactNode, useRef, useState } from "react";
import { Button, Overlay, Popover } from "react-bootstrap";

type ConfirmProps = {
  message: string;
  onConfirmed: () => void;
  children: (props: { onClick: () => void }) => ReactNode;
};

export default function Confirm(props: ConfirmProps) {
  const target = useRef(null);
  const [show, setShow] = useState(false);

  const onClick = () => setShow(true);

  return (
    <>
      <Overlay target={target.current} show={show} placement="right">
        {(options) => (
          <Popover {...options}>
            <Popover.Header>確認</Popover.Header>
            <Popover.Body>
              <p>{props.message}</p>
              <div>
                <Button
                  className="mx-1"
                  variant="danger"
                  onClick={() => {
                    props.onConfirmed();
                    setShow(false);
                  }}
                >
                  はい
                </Button>
                <Button
                  className="mx-1"
                  variant="secondary"
                  onClick={() => setShow(false)}
                >
                  いいえ
                </Button>
              </div>
            </Popover.Body>
          </Popover>
        )}
      </Overlay>
      <div ref={target} style={{ display: "inline-block" }}>
        {props.children({ onClick })}
      </div>
    </>
  );
}
