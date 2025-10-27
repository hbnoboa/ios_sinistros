import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

const API = "/api";

export default function Dashboard() {
  const { token, tenant } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  // filtros
  const [q, setQ] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [insurer, setInsurer] = useState("");
  const [insured, setInsured] = useState("");
  const [broker, setBroker] = useState("");
  const [regulator, setRegulator] = useState("");
  const [riskManager, setRiskManager] = useState("");
  const [shipper, setShipper] = useState("");

  // listas para selects
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);
  const [insureds, setInsureds] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [regulators, setRegulators] = useState([]);
  const [riskManagers, setRiskManagers] = useState([]);
  const [shippers, setShippers] = useState([]);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}`, "x-tenant-id": tenant }),
    [token, tenant]
  );

  // Normaliza formatos comuns de payload em array
  const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.insuranceCompanies)) return data.insuranceCompanies;
    if (Array.isArray(data?.insureds)) return data.insureds;
    if (Array.isArray(data?.brokers)) return data.brokers;
    if (Array.isArray(data?.regulators)) return data.regulators;
    if (Array.isArray(data?.riskManagers)) return data.riskManagers;
    if (Array.isArray(data?.shippingCompanies)) return data.shippingCompanies;
    return [];
  };

  useEffect(() => {
    const loadLists = async () => {
      try {
        const [rInsurers, rInsureds, rBrokers, rRegs, rRisk, rShippers] =
          await Promise.all([
            fetch(`${API}/insurance-companies`, { headers }),
            fetch(`${API}/insureds`, { headers }),
            fetch(`${API}/brokers`, { headers }),
            fetch(`${API}/regulators`, { headers }),
            fetch(`${API}/risk-managers`, { headers }),
            fetch(`${API}/shipping-companies`, { headers }),
          ]);
        const [dInsurers, dInsureds, dBrokers, dRegs, dRisk, dShippers] =
          await Promise.all([
            rInsurers.json(),
            rInsureds.json(),
            rBrokers.json(),
            rRegs.json(),
            rRisk.json(),
            rShippers.json(),
          ]);

        setInsuranceCompanies(toArray(dInsurers));
        setInsureds(toArray(dInsureds));
        setBrokers(toArray(dBrokers));
        setRegulators(toArray(dRegs));
        setRiskManagers(toArray(dRisk));
        setShippers(toArray(dShippers));
      } catch (e) {
        setInsuranceCompanies([]);
        setInsureds([]);
        setBrokers([]);
        setRegulators([]);
        setRiskManagers([]);
        setShippers([]);
      }
    };
    loadLists();
  }, [headers]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    if (insurer) params.set("insurance_company_name", insurer);
    if (insured) params.set("insured_name", insured);
    if (broker) params.set("broker_email", broker);
    if (regulator) params.set("regulatory", regulator);
    if (riskManager) params.set("risk_manager", riskManager);
    if (shipper) params.set("shipping_company", shipper);
    return params.toString();
  };

  const load = async () => {
    setLoading(true);
    try {
      const qs = buildQuery();
      const res = await fetch(`${API}/attendances${qs ? `?${qs}` : ""}`, {
        headers,
      });
      const data = await res.json();
      const list = toArray(data);
      setItems(list);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const clearFilters = () => {
    setQ("");
    setStart("");
    setEnd("");
    setInsurer("");
    setInsured("");
    setBroker("");
    setRegulator("");
    setRiskManager("");
    setShipper("");
  };

  // KPIs básicos
  const kpis = useMemo(() => {
    const total = items.length;
    const closed = items.filter((x) => !!x.closing_date).length;
    const open = total - closed;
    return { total, open, closed };
  }, [items]);

  return (
    <div className="dark-theme">
      <h2>Dashboard</h2>

      <Card className="bg-dark text-white mb-3" style={{ borderColor: "#444" }}>
        <Card.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
          >
            <Row className="g-2">
              <Col md={3}>
                <Form.Label>Período inicial</Form.Label>
                <Form.Control
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="bg-dark text-white"
                />
              </Col>
              <Col md={3}>
                <Form.Label>Período final</Form.Label>
                <Form.Control
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="bg-dark text-white"
                />
              </Col>
              <Col md={6}>
                <Form.Label>Busca rápida</Form.Label>
                <InputGroup>
                  <Form.Control
                    placeholder="Apólice, segurado, nº sinistro..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="bg-dark text-white"
                  />
                  <Button type="submit" className="btn-dark btn-bordered">
                    Buscar
                  </Button>
                </InputGroup>
              </Col>
            </Row>

            <Row className="g-2 mt-1">
              <Col md={4}>
                <Form.Label>Seguradora</Form.Label>
                <Form.Select
                  value={insurer}
                  onChange={(e) => setInsurer(e.target.value)}
                  className="bg-dark text-white"
                >
                  <option value="">Todas</option>
                  {insuranceCompanies.map((c) => (
                    <option key={c._id} value={c.company_name}>
                      {c.company_name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Segurado</Form.Label>
                <Form.Select
                  value={insured}
                  onChange={(e) => setInsured(e.target.value)}
                  className="bg-dark text-white"
                >
                  <option value="">Todos</option>
                  {insureds.map((i) => (
                    <option key={i._id} value={i.company_name}>
                      {i.company_name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Corretor</Form.Label>
                <Form.Select
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  className="bg-dark text-white"
                >
                  <option value="">Todos</option>
                  {brokers.map((b) => (
                    <option key={b._id || b.email} value={b.email}>
                      {b.name || b.email}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Row className="g-2 mt-1">
              <Col md={4}>
                <Form.Label>Reguladora</Form.Label>
                <Form.Select
                  value={regulator}
                  onChange={(e) => setRegulator(e.target.value)}
                  className="bg-dark text-white"
                >
                  <option value="">Todas</option>
                  {regulators.map((r) => (
                    <option key={r._id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Gerenciadora de Risco</Form.Label>
                <Form.Select
                  value={riskManager}
                  onChange={(e) => setRiskManager(e.target.value)}
                  className="bg-dark text-white"
                >
                  <option value="">Todas</option>
                  {riskManagers.map((r) => (
                    <option key={r._id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Label>Transportadora</Form.Label>
                <Form.Select
                  value={shipper}
                  onChange={(e) => setShipper(e.target.value)}
                  className="bg-dark text-white"
                >
                  <option value="">Todas</option>
                  {shippers.map((s) => (
                    <option key={s._id} value={s.company_name}>
                      {s.company_name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <div className="d-flex gap-2 mt-3">
              <Button type="submit" className="btn-orange">
                Aplicar filtros
              </Button>
              <Button
                type="button"
                className="btn-dark btn-bordered"
                onClick={() => {
                  clearFilters();
                  setTimeout(load, 0);
                }}
              >
                Limpar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Card
            className="bg-dark text-white kpi-card"
            style={{ borderColor: "#444" }}
          >
            <Card.Body>
              <div className="kpi-label">Total</div>
              <div className="kpi-value">{kpis.total}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="bg-dark text-white kpi-card"
            style={{ borderColor: "#444" }}
          >
            <Card.Body>
              <div className="kpi-label">Abertos</div>
              <div className="kpi-value">{kpis.open}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card
            className="bg-dark text-white kpi-card"
            style={{ borderColor: "#444" }}
          >
            <Card.Body>
              <div className="kpi-label">Encerrados</div>
              <div className="kpi-value">{kpis.closed}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" /> Carregando...
        </div>
      ) : (
        <Card className="bg-dark text-white" style={{ borderColor: "#444" }}>
          <Card.Body>
            <Table
              striped
              bordered
              hover
              responsive
              variant="dark"
              className="table-dark align-middle"
            >
              <thead>
                <tr>
                  <th>Apólice</th>
                  <th>Segurado</th>
                  <th>Seguradora</th>
                  <th>Nº Sinistro</th>
                  <th>Data do Evento</th>
                  <th>Encerramento</th>
                  <th style={{ width: 120 }}>Ações</th>
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
                    <td>{it.insurance_company_name || "—"}</td>
                    <td>{it.insurance_claim_number || "—"}</td>
                    <td>
                      {it.event_date
                        ? new Date(it.event_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      {it.closing_date
                        ? new Date(it.closing_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <Button
                        as={Link}
                        to={`/attendances/${it._id}`}
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
                        to={`/attendances/${it._id}/edit`}
                        size="sm"
                        className="btn-dark"
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
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted">
                      Nenhum atendimento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
