import React, { useState } from "react";
import { Form, Button, Row, Col, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API = "/api/shipping-companies";

const ShippingCompanyNew = () => {
  const [form, setForm] = useState({
    company_name: "",
    cnpj_cpf: "",
    rntrc: "",
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
      if (!res.ok)
        throw new Error(data?.error || "Erro ao criar transportadora");
      navigate("/shipping-companies");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-dark text-white" style={{ borderColor: "#444" }}>
      <Card.Body>
        <Card.Title>Nova Transportadora</Card.Title>
        {err && <Alert variant="danger">{err}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="8">
              <Form.Label>Razão Social</Form.Label>
              <Form.Control
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group as={Col} md="4">
              <Form.Label>CNPJ/CPF</Form.Label>
              <Form.Control
                name="cnpj_cpf"
                value={form.cnpj_cpf}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="4">
              <Form.Label>RNTRC</Form.Label>
              <Form.Control
                name="rntrc"
                value={form.rntrc}
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
              onClick={() => navigate("/shipping-companies")}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ShippingCompanyNew;
