import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  ListGroup,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";

const RegulatorShow = () => {
  // const { attendanceId, id } = useParams();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant") || "IOS";
  const API = `/api/regulators`;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API}/${id}`, {
          headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Erro ao carregar regulador");
        setItem(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API, id, tenant, token]);

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" /> Carregando...
      </div>
    );
  }

  if (err) return <Alert variant="danger">{err}</Alert>;
  if (!item) return <Alert variant="warning">Regulador não encontrado.</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Regulador</h2>
        <div className="d-flex gap-2">
          <Button
            as={Link}
            to={`/regulators/${id}/edit`}
            className="btn-dark"
            title="Editar"
          >
            <img
              src="/icons/edit.png"
              alt="Editar"
              style={{ height: 30, display: "block", filter: "invert(1)" }}
            />
          </Button>
          <Button
            as={Link}
            to={`/regulators`}
            className="btn-dark"
            title="Voltar"
          >
            <img
              src="/icons/back.png"
              alt="Voltar"
              style={{ height: 30, display: "block", filter: "invert(1)" }}
            />
          </Button>
        </div>
      </div>

      <Card className="bg-dark text-white" style={{ borderColor: "#444" }}>
        <Card.Body>
          <Row>
            <Col md={6}>
              <ListGroup variant="flush" className="list-group-dark">
                <ListGroup.Item>
                  <strong>Nome:</strong> {item.name || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>CNPJ:</strong> {item.cnpj || "—"}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={6}>
              <ListGroup variant="flush" className="list-group-dark">
                <ListGroup.Item>
                  <strong>E-mail:</strong> {item.email || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Telefone:</strong> {item.phone || "—"}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RegulatorShow;
