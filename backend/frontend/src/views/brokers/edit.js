import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

const API = "/api/brokers";

const BrokerEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    email: "",
    phone: "",
    state: "",
    city: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant") || "IOS";

  useEffect(() => {
    const load = async () => {
      setErr("");
      setLoading(true);
      try {
        const res = await fetch(`${API}/${id}`, {
          headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Erro ao carregar corretor");
        setForm({
          email: data.email || "",
          phone: data.phone || "",
          state: data.state || "",
          city: data.city || "",
          address: data.address || "",
        });
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, tenant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenant,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao atualizar corretor");
      navigate("/brokers");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" /> Carregando...
      </div>
    );
  }

  return (
    <Card className="bg-dark text-white" style={{ borderColor: "#444" }}>
      <Card.Body>
        <Card.Title>Editar Corretor</Card.Title>
        {err && <Alert variant="danger">{err}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
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

          <Row className="mb-3">
            <Form.Group as={Col} md="4">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                name="state"
                value={form.state}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} md="4">
              <Form.Label>Cidade</Form.Label>
              <Form.Control
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} md="4">
              <Form.Label>Endereço</Form.Label>
              <Form.Control
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" disabled={saving} className="btn-orange">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="secondary" onClick={() => navigate("/brokers")}>
              Cancelar
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BrokerEdit;
