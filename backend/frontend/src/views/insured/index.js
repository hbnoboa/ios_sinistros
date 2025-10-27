import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Alert,
  Spinner,
  Form,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const InsuredIndex = () => {
  const [insureds, setInsureds] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant") || "IOS";

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const qs = filter ? `?filter=${encodeURIComponent(filter)}` : "";
      const res = await fetch(`/api/insureds${qs}`, {
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao listar segurados");
      setInsureds(data.insureds || data || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load();
  };

  const onDelete = async (id) => {
    if (!window.confirm("Deseja realmente excluir este segurado?")) return;
    try {
      const res = await fetch(`/api/insureds/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Erro ao excluir");
      setInsureds((prev) => prev.filter((i) => i._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="dark-theme">
      <h2>Segurados</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form
          onSubmit={onSearch}
          className="me-2"
          style={{ maxWidth: 420, width: "100%" }}
        >
          <InputGroup>
            <Form.Control
              className="bg-dark text-white"
              placeholder="Filtrar por razão social, fantasia, CNPJ, cidade, estado"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button type="submit" className="btn-dark btn-bordered">
              Buscar
            </Button>
          </InputGroup>
        </Form>
        <Button as={Link} to="/insureds/new" className="btn-dark">
          <img
            src="/icons/plus.png"
            alt="Adicionar"
            style={{
              height: 30,
              display: "block",
              filter: "invert(1)",
            }}
          />
        </Button>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}
      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" /> Carregando...
        </div>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          variant="dark"
          className="table-dark"
        >
          <thead>
            <tr>
              <th>Razão Social</th>
              <th>Nome Fantasia</th>
              <th>CNPJ</th>
              <th style={{ width: 260 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {insureds.map((insured) => (
              <tr key={insured._id}>
                <td>
                  <Link to={`/insureds/${insured._id}`}>
                    {insured.company_name}
                  </Link>
                </td>
                <td>{insured.fantasy_name || "—"}</td>
                <td>{insured.cnpj || "—"}</td>
                <td>
                  <Button
                    as={Link}
                    to={`/insureds/${insured._id}`}
                    size="sm"
                    className="btn-dark me-2"
                    title="Ver"
                  >
                    <img
                      src="/icons/view.png"
                      alt="Ver"
                      style={{
                        height: 16,
                        display: "block",
                        filter: "invert(1)",
                      }}
                    />
                  </Button>
                  <Button
                    as={Link}
                    to={`/insureds/${insured._id}/edit`}
                    size="sm"
                    className="btn-dark me-2"
                    title="Editar"
                  >
                    <img
                      src="/icons/edit.png"
                      alt="Editar"
                      style={{
                        height: 16,
                        display: "block",
                        filter: "invert(1)",
                      }}
                    />
                  </Button>
                  <Button
                    size="sm"
                    className="btn-dark"
                    onClick={() => onDelete(insured._id)}
                    title="Excluir"
                  >
                    <img
                      src="/icons/delete.png"
                      alt="Excluir"
                      style={{
                        height: 16,
                        display: "block",
                        filter: "invert(1)",
                      }}
                    />
                  </Button>
                </td>
              </tr>
            ))}
            {!insureds.length && (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  Nenhum segurado encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default InsuredIndex;
