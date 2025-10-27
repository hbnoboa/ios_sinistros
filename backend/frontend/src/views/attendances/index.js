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

const API = "/api/attendances";

const AttendancesIndex = () => {
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
      // Backend atual não possui filtro; mantemos no client-side simples
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || "Erro ao listar atendimentos");
      let list = data.attendances || data || [];
      if (filter) {
        const f = filter.toLowerCase();
        list = list.filter(
          (a) =>
            (a.policy_number || "").toLowerCase().includes(f) ||
            (a.insured_name || "").toLowerCase().includes(f) ||
            (a.insurance_claim_number || "").toLowerCase().includes(f) ||
            (a.regulator_claim_number || "").toLowerCase().includes(f)
        );
      }
      setItems(list);
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
    if (!window.confirm("Deseja realmente excluir este atendimento?")) return;
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
      <h2>Atendimentos</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form
          onSubmit={onSearch}
          className="me-2"
          style={{ maxWidth: 420, width: "100%" }}
        >
          <InputGroup>
            <Form.Control
              className="bg-dark text-white"
              placeholder="Filtrar por apólice, segurado, nº sinistro"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Button type="submit" className="btn-dark btn-bordered">
              Buscar
            </Button>
          </InputGroup>
        </Form>
        <Button as={Link} to="/attendances/new" className="btn-dark">
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
              <th>Apólice</th>
              <th>Segurado</th>
              <th>Nº Sinistro Seguradora</th>
              <th>Data do Evento</th>
              <th style={{ width: 260 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id}>
                <td>
                  <Link to={`/attendances/${it._id}`}>
                    {it.policy_number || "—"}
                  </Link>
                </td>
                <td>{it.insured_name || "—"}</td>
                <td>{it.insurance_claim_number || "—"} </td>
                <td>
                  {it.event_date
                    ? new Date(it.event_date).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  <Button
                    as={Link}
                    to={`/attendances/${it._id}`}
                    size="sm"
                    className="btn-dark me-2"
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
                    to={`/attendances/${it._id}/edit`}
                    size="sm"
                    className="btn-dark me-2"
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
                    className="btn-dark me-2"
                    onClick={() => onDelete(it._id)}
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
                  Nenhum atendimento encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default AttendancesIndex;
