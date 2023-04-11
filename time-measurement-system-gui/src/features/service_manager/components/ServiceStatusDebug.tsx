import { Button, Card, Table } from "react-bootstrap";
import { useServiceStatus } from "../store";
import Loader from "../../../ui/Loader";

export default function ServiceStatusDebug() {
  const { start, stop, status } = useServiceStatus();
  return (
    <Card>
      <Card.Header>Subsystem status</Card.Header>
      <Card.Body>a
        <Loader data={status.data?.services}>
          {(data) => (
            <Table>
              <thead>
                <tr>
                  <th>id</th>
                  <th>state</th>
                  <th>args</th>
                  <th>control</th>
                </tr>
              </thead>
              <tbody>
                {data.map((service) => (
                  <tr key={service.id}>
                    <td>{service.id}</td>
                    <td>{service.state}</td>
                    <td>
                      <code>{service.args.join(" ")}</code>
                    </td>
                    <td>
                      <Button
                        className="me-1"
                        onClick={() => start(service.id)}
                      >
                        {service.state === "running" ? "Restart" : "Start"}
                      </Button>
                      <Button onClick={() => stop(service.id)}>Stop</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Loader>
      </Card.Body>
    </Card>
  );
}
