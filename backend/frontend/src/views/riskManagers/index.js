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

const API = "/api/risk-managers";

const RiskManagersIndex = () => {
  const [items, setItems] = useState([]);
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
      const res = await fetch(`${API}${qs}`, {
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Erro ao listar gestores de risco");
      setItems(data.riskManagers || data || []);
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
    if (!window.confirm("Deseja realmente excluir este gestor de risco?"))
      return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Erro ao excluir");
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="dark-theme">
      <h2>Gestores de Risco</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form
          onSubmit={onSearch}
          className="me-2"
          style={{ maxWidth: 420, width: "100%" }}
        >
          <InputGroup>
            <Form.Control
              className="bg-dark text-white"
              placeholder="Filtrar por nome, CNPJ, e-mail, telefone"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button type="submit" className="btn-dark btn-bordered">
              Buscar
            </Button>
          </InputGroup>
        </Form>
        <Button as={Link} to="/risk-managers/new" className="btn-dark">
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
              <th>Nome</th>
              <th>CNPJ</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th style={{ width: 260 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id}>
                <td>
                  <Link to={`/risk-managers/${it._id}`}>{it.name}</Link>
                </td>
                <td>{it.cnpj || "—"}</td>
                <td>{it.email || "—"}</td>
                <td>{it.phone || "—"}</td>
                <td>
                  <Button
                    as={Link}
                    to={`/risk-managers/${it._id}`}
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
                    to={`/risk-managers/${it._id}/edit`}
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
                    onClick={() => onDelete(it._id)}
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
            {!items.length && (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  Nenhum gestor encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default RiskManagersIndex;
