import React, { useState } from "react";
import { Form, Button, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API = "/api/risk-managers";

const RiskManagerNew = () => {
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    phone: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant") || "IOS";

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenant,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar gestor");
      navigate("/risk-managers");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-dark text-white" style={{ borderColor: "#444" }}>
      <Card.Body>
        <Card.Title>Novo Gestor de Risco</Card.Title>
        {err && <Alert variant="danger">{err}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group as={Col} md="6">
              <Form.Label>CNPJ</Form.Label>
              <Form.Control
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} md="6">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" disabled={saving} className="btn-orange">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/risk-managers")}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RiskManagerNew;
