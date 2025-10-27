import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

const InsuredEdit = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    company_name: "",
    fantasy_name: "",
    cnpj: "",
    email: "",
    state: "",
    city: "",
    address: "",
    business_field: "",
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
        const res = await fetch(`/api/insureds/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-tenant-id": tenant,
          },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Erro ao carregar segurado");
        setForm({
          company_name: data.company_name || "",
          fantasy_name: data.fantasy_name || "",
          cnpj: data.cnpj || "",
          email: data.email || "",
          state: data.state || "",
          city: data.city || "",
          address: data.address || "",
          business_field: data.business_field || "",
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
      const res = await fetch(`/api/insureds/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenant,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao atualizar segurado");
      navigate("/insureds");
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
        <Card.Title>Editar Segurado</Card.Title>
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
              <Form.Label>Nome Fantasia</Form.Label>
              <Form.Control
                name="fantasy_name"
                value={form.fantasy_name}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="4">
              <Form.Label>CNPJ</Form.Label>
              <Form.Control
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} md="4">
              <Form.Label>EMAIL</Form.Label>
              <Form.Control
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
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="8">
              <Form.Label>Endereço</Form.Label>
              <Form.Control
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} md="4">
              <Form.Label>Ramo de Atividade</Form.Label>
              <Form.Control
                name="business_field"
                value={form.business_field}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <div className="d-flex gap-2">
            <Button type="submit" disabled={saving} className="btn-orange">
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="secondary" onClick={() => navigate("/insureds")}>
              Cancelar
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default InsuredEdit;
