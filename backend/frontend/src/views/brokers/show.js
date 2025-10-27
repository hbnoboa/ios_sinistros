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
import { Link, useNavigate, useParams } from "react-router-dom";

const API = "/api/brokers";

const BrokerShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant") || "IOS";

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
          throw new Error(data?.error || "Erro ao carregar corretor");
        setItem(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, tenant]);

  const onDelete = async () => {
    if (!window.confirm("Deseja realmente excluir este corretor?")) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Erro ao excluir");
      navigate("/brokers");
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" /> Carregando...
      </div>
    );
  }

  if (err) return <Alert variant="danger">{err}</Alert>;
  if (!item) return <Alert variant="warning">Corretor não encontrado.</Alert>;

  const coords =
    item.location?.type === "Point" && Array.isArray(item.location.coordinates)
      ? item.location.coordinates
      : null;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Corretor</h2>
        <div className="d-flex gap-2">
          <Button
            as={Link}
            to={`/brokers/${id}/edit`}
            className="btn-dark"
            title="Editar"
          >
            <img
              src="/icons/edit.png"
              alt="Editar"
              style={{ height: 30, display: "block", filter: "invert(1)" }}
            />
          </Button>
          <Button className="btn-dark" onClick={onDelete} title="Excluir">
            <img
              src="/icons/delete.png"
              alt="Excluir"
              style={{ height: 30, display: "block", filter: "invert(1)" }}
            />
          </Button>
          <Button as={Link} to="/brokers" className="btn-dark" title="Voltar">
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
                  <strong>E-mail:</strong> {item.email || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Telefone:</strong> {item.phone || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Estado:</strong> {item.state || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Cidade:</strong> {item.city || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Endereço:</strong> {item.address || "—"}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={6}>
              <ListGroup variant="flush" className="list-group-dark">
                <ListGroup.Item>
                  <strong>Coordenadas:</strong>{" "}
                  {coords ? `${coords[1]}, ${coords[0]}` : "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Criado em:</strong>{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Atualizado em:</strong>{" "}
                  {item.updatedAt
                    ? new Date(item.updatedAt).toLocaleString()
                    : "—"}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BrokerShow;
