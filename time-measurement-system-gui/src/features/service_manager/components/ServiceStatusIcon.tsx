import { faCheck, faCross, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useServiceStatus } from "../store";

type ServiceStatusIconProps = {
  service: string;
};

export default function ServiceStatusIcon(props: ServiceStatusIconProps) {
  const { status } = useServiceStatus();

  const state = status.data?.services.find(
    (service) => service.id === props.service
  )?.state;

  if (state === "running") {
    return <FontAwesomeIcon className="me-1" icon={faCheck} />;
  }

  if (state === "not-running") {
    return <FontAwesomeIcon className="me-1" icon={faXmark} />;
  }

  return <FontAwesomeIcon className="me-1" icon={faSpinner} />;
}
