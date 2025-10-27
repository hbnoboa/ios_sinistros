import React, { useState } from "react";
import { Form, Button, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API = "/api/insurance-companies";

const InsuranceCompanyNew = () => {
  const [form, setForm] = useState({
    company_name: "",
    cnpj: "",
    phone: "",
    email: "",
    state: "",
    city: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant") || "IOS";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

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
      if (!res.ok) throw new Error(data?.error || "Erro ao criar seguradora");
      navigate("/insurance-companies");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-dark text-white" style={{ borderColor: "#444" }}>
      <Card.Body>
        <Card.Title>Nova Seguradora</Card.Title>
        {err && <Alert variant="danger">{err}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6">
              <Form.Label>Razão Social</Form.Label>
              <Form.Control
                name="company_name"
                value={form.company_name}
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
            <Form.Group as={Col} md="4">
              <Form.Label>Telefone</Form.Label>
              <Form.Control
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} md="8">
              <Form.Label>E-mail</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
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
            <Button
              variant="secondary"
              onClick={() => navigate("/insurance-companies")}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default InsuranceCompanyNew;
