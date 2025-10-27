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

const InsuredShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [insured, setInsured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant") || "IOS";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`/api/insureds/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-tenant-id": tenant,
          },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Erro ao carregar segurado");
        setInsured(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, tenant]);

  const onDelete = async () => {
    if (!window.confirm("Deseja realmente excluir este segurado?")) return;
    try {
      const res = await fetch(`/api/insureds/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenant,
        },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Erro ao excluir");
      }
      navigate("/insureds");
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
  if (!insured)
    return <Alert variant="warning">Segurado não encontrado.</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Segurado</h2>
        <div className="d-flex gap-2">
          <Button
            as={Link}
            to={`/insureds/${id}/edit`}
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
          <Button as={Link} to="/insureds" className="btn-dark" title="Voltar">
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
                  <strong>Razão Social:</strong> {insured.company_name || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Nome Fantasia:</strong> {insured.fantasy_name || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>CNPJ:</strong> {insured.cnpj || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Ramo de Atividade:</strong>{" "}
                  {insured.business_field || "—"}
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={6}>
              <ListGroup variant="flush" className="list-group-dark">
                <ListGroup.Item>
                  <strong>Estado:</strong> {insured.state || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Cidade:</strong> {insured.city || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Endereço:</strong> {insured.address || "—"}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Criado em:</strong>{" "}
                  {insured.createdAt
                    ? new Date(insured.createdAt).toLocaleString()
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

export default InsuredShow;
