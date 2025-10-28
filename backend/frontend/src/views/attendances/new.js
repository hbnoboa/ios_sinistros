import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API = "/api/attendances";

// Campos do formulário principal
const initialForm = {
  broker_name: "",
  broker_email: "",
  insurance_company_name: "",
  insured_name: "",
  insured_cnpj: "",
  insured_email: "",
  policy_number: "",
  line_of_business: "",
  regulatory: "",
  risk_manager: "",
  insurance_claim_number: "",
  regulator_claim_number: "",
  loss_estimation: "",
  deductible: "",
  pos: "",
  fixed_loss: "",
  indemnified_loss: "",
  closing_date: "",
  cause: "",
  cause_type: "",
  event_date: "",
  event_time: "",
  notice_date: "",
  notice_time: "",
  event_address: "",
  event_city: "",
  event_state: "",
  event_latitude: "",
  event_longitude: "",
  shipping_company: "",
  shipping_company_cnpj: "",
  shipping_company_email: "",
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_year: "",
  vehicle_plate: "",
  cart_brand: "",
  cart_model: "",
  cart_year: "",
  cart_plate: "",
  driver_name: "",
  driver_cpf: "",
  driver_cnh: "",
  birth_year: "",
  sender_name: "",
  origin_city: "",
  origin_state: "",
  receiver_name: "",
  destination_city: "",
  destination_state: "",
  invoice_number: "",
  invoice_value: "",
  goods: "",
  risk_classification: "",
  cte_number: "",
  cte_value: "",
  mdfe_number: "",
  mdfe_value: "",
  averbacao_number: "",
  averbacao_value: "",
  event_description: "",
  notes: "",
  followup: [],
};

const documents = [
  "NF",
  "CTE",
  "MDFE",
  "AVERBAÇÃO",
  "CNH",
  "BOLETIM DE OCORRÊNCIA",
  "BOLETIM DE OCORRÊNCIA DE FURTO",
  "DECLARAÇÃO DO MOTORISTA",
  "DOCUMENTOS DO VEÍCULO",
  "TACÓGRAFO",
  "DOCUMENTO DE TERCEIROS",
  "FOTOS DO SINISTRO",
  "RELATÓRIOS DE MONITORAMENTO",
  "RELATÓRIO DA REGULADORA",
];

const AttendanceNew = () => {
  const [form, setForm] = useState(initialForm);
  // novas listas
  const [brokers, setBrokers] = useState([]);
  const [insureds, setInsureds] = useState([]);
  const [insurers, setInsurers] = useState([]);
  const [regulatorsList, setRegulatorsList] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [riskManagers, setRiskManagers] = useState([]);
  // Estados e cidades (IBGE)
  const [states, setStates] = useState([]);
  const [eventCities, setEventCities] = useState([]);
  const [originCities, setOriginCities] = useState([]);
  const [destinationCities, setDestinationCities] = useState([]);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [key, setKey] = useState("cadastro");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant") || "IOS";

  // Captura o e-mail do usuário (localStorage ou JWT)
  const getUserEmail = () => {
    const stored = localStorage.getItem("userEmail");
    if (stored) return stored;
    try {
      const [, payload] = (token || "").split(".");
      if (!payload) return "";
      const data = JSON.parse(atob(payload));
      return data.email || data.user?.email || data.sub || "";
    } catch {
      return "";
    }
  };

  const setField = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Follow-up: somente ações e prazo; data/hora/responsável automáticos
  const [fu, setFu] = useState({ actions: "", return_date: "" });
  const addFollowup = () => {
    if (!fu.actions) return;
    const now = new Date();
    const ret = fu.return_date ? new Date(fu.return_date) : null;
    const userEmail = getUserEmail();
    setForm((f) => ({
      ...f,
      followup: [
        ...f.followup,
        {
          datetime: now,
          actions: fu.actions,
          user: userEmail,
          return_date: ret,
        },
      ],
    }));
    setFu({ actions: "", return_date: "" });
  };
  const removeFollowup = (idx) => {
    setForm((f) => ({
      ...f,
      followup: f.followup.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      // Converte números
      const body = { ...form };
      [
        "loss_estimation",
        "deductible",
        "fixed_loss",
        "indemnified_loss",
        "invoice_value",
        "cte_value",
        "mdfe_value",
        "averbacao_value",
        "event_latitude",
        "event_longitude",
      ].forEach((k) => {
        if (body[k] === "") delete body[k];
      });
      if (!body.closing_date) delete body.closing_date;

      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-tenant-id": tenant,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao criar atendimento");
      navigate(`/attendances/${data._id}`);
    } catch (e) {
      setErr(e.message);
      setKey("cadastro");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}`, "x-tenant-id": tenant };
    const loadAll = async () => {
      try {
        const [rBrokers, rInsureds, rInsurers, rRegulators, rShippers, rRisk] =
          await Promise.all([
            fetch("/api/brokers", { headers }),
            fetch("/api/insureds", { headers }),
            fetch("/api/insurance-companies", { headers }),
            fetch("/api/regulators", { headers }),
            fetch("/api/shipping-companies", { headers }),
            fetch("/api/risk-managers", { headers }),
          ]);
        const [dBrokers, dInsureds, dInsurers, dRegulators, dShippers, dRisk] =
          await Promise.all([
            rBrokers.json(),
            rInsureds.json(),
            rInsurers.json(),
            rRegulators.json(),
            rShippers.json(),
            rRisk.json(),
          ]);
        setBrokers(dBrokers?.items || dBrokers?.brokers || dBrokers || []);
        setInsureds(dInsureds?.insureds || dInsureds?.items || dInsureds || []);
        setInsurers(
          dInsurers?.items || dInsurers?.insuranceCompanies || dInsurers || []
        );
        setRegulatorsList(
          dRegulators?.items || dRegulators?.regulators || dRegulators || []
        );
        setShippers(
          dShippers?.items || dShippers?.shippingCompanies || dShippers || []
        );
        setRiskManagers(dRisk?.items || dRisk?.riskManagers || dRisk || []);
      } catch {
        // silencioso
      }
    };
    loadAll();
    // eslint-disable-next-line
  }, []);

  // IBGE: carrega Estados (UF) uma vez
  useEffect(() => {
    fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
    )
      .then((r) => r.json())
      .then((data) => setStates(Array.isArray(data) ? data : []))
      .catch(() => setStates([]));
  }, []);

  // IBGE: cidades por UF - Evento
  useEffect(() => {
    if (!form.event_state) {
      setEventCities([]);
      return;
    }
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.event_state}/municipios`
    )
      .then((r) => r.json())
      .then((data) => setEventCities(Array.isArray(data) ? data : []))
      .catch(() => setEventCities([]));
  }, [form.event_state]);

  // IBGE: cidades por UF - Origem
  useEffect(() => {
    if (!form.origin_state) {
      setOriginCities([]);
      return;
    }
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.origin_state}/municipios`
    )
      .then((r) => r.json())
      .then((data) => setOriginCities(Array.isArray(data) ? data : []))
      .catch(() => setOriginCities([]));
  }, [form.origin_state]);

  // IBGE: cidades por UF - Destino
  useEffect(() => {
    if (!form.destination_state) {
      setDestinationCities([]);
      return;
    }
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.destination_state}/municipios`
    )
      .then((r) => r.json())
      .then((data) => setDestinationCities(Array.isArray(data) ? data : []))
      .catch(() => setDestinationCities([]));
  }, [form.destination_state]);

  return (
    <Card className="bg-dark text-white" style={{ borderColor: "#444" }}>
      <Card.Body>
        <Card.Title>Novo Atendimento</Card.Title>
        {err && <Alert variant="danger">{err}</Alert>}

        <Tabs
          activeKey={key}
          onSelect={(k) => setKey(k || "cadastro")}
          className="mb-3 orange-tabs tabs-dark"
          fill
        >
          <Tab eventKey="cadastro" title="Cadastro">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Form.Group as={Col} md="6">
                  <Form.Label>CORRETOR</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    value={form.broker_email}
                    onChange={(e) => {
                      const email = e.target.value;
                      const b = brokers.find((x) => x.email === email) || null;
                      setForm((f) => ({
                        ...f,
                        broker_name: b?.name || email || "",
                        broker_email: email || "",
                      }));
                    }}
                  >
                    <option value="">Selecione...</option>
                    {brokers.map((b) => (
                      <option key={b._id || b.email} value={b.email}>
                        {b.name || b.email}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} md="6">
                  <Form.Label>e-mail</Form.Label>
                  <Form.Control
                    type="email"
                    name="breoker_email"
                    value={form.broker_email}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="">
                  <Form.Label>SEGURADORA</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    value={form.insurance_company_name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        insurance_company_name: e.target.value,
                      }))
                    }
                  >
                    <option value="">Selecione...</option>
                    {insurers.map((c) => (
                      <option key={c._id} value={c.company_name}>
                        {c.company_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} md="4">
                  <Form.Label>SEGURADO</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    value={form.insured_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const i =
                        insureds.find((x) => x.company_name === name) || null;
                      setForm((f) => ({
                        ...f,
                        insured_name: name,
                        insured_cnpj: i?.cnpj || f.insured_cnpj || "",
                        insured_email: i?.email || f.insured_email || "",
                      }));
                    }}
                  >
                    <option value="">Selecione...</option>
                    {insureds.map((i) => (
                      <option key={i._id} value={i.company_name}>
                        {i.company_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>CNPJ</Form.Label>
                  <Form.Control
                    name="insured_cnpj"
                    value={form.insured_cnpj}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>e-mail</Form.Label>
                  <Form.Control
                    type="email"
                    name="insured_email"
                    value={form.insured_email}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="6">
                  <Form.Label>APÓLICE</Form.Label>
                  <Form.Control
                    name="policy_number"
                    value={form.policy_number}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="6">
                  <Form.Label>RAMO</Form.Label>
                  <Form.Control
                    name="line_of_business"
                    value={form.line_of_business}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="6">
                  <Form.Label>REGULADORA</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    value={form.regulatory}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, regulatory: e.target.value }))
                    }
                  >
                    <option value="">Selecione...</option>
                    {regulatorsList.map((r) => (
                      <option key={r._id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} md="6">
                  <Form.Label>GERENCIADORA DE RISCOS</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    value={form.risk_manager}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, risk_manager: e.target.value }))
                    }
                  >
                    <option value="">Selecione...</option>
                    {riskManagers.map((r) => (
                      <option key={r._id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="6">
                  <Form.Label>NÚMERO DO SINISTRO SEGURADORA</Form.Label>
                  <Form.Control
                    name="insurance_claim_number"
                    value={form.insurance_claim_number}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="6">
                  <Form.Label>NÚMERO DO SINISTRO REGULADORA</Form.Label>
                  <Form.Control
                    name="regulator_claim_number"
                    value={form.regulator_claim_number}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="4">
                  <Form.Label>ESTIMATIVA DE PREJUÍZO</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="loss_estimation"
                    value={form.loss_estimation}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>FRANQUIA</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="deductible"
                    value={form.deductible}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>POS</Form.Label>
                  <Form.Control
                    name="pos"
                    value={form.pos}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="4">
                  <Form.Label>PREJUÍZO FIXADO</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="fixed_loss"
                    value={form.fixed_loss}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>PREJUÍZO INDENIZADO</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="indemnified_loss"
                    value={form.indemnified_loss}
                    onChange={setField}
                  />
                </Form.Group>

                <Form.Group as={Col} md="4">
                  <Form.Label>DATA DE FINALIZAÇÃO</Form.Label>
                  <Form.Control
                    type="date"
                    name="closing_date"
                    value={form.closing_date}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="6">
                  <Form.Label>CAUSA</Form.Label>
                  <Form.Control
                    name="cause"
                    value={form.cause}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="6">
                  <Form.Label>TIPO DA CAUSA</Form.Label>
                  <Form.Control
                    name="cause_type"
                    value={form.cause_type}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="3">
                  <Form.Label>DATA DO EVENTO</Form.Label>
                  <Form.Control
                    type="date"
                    name="event_date"
                    value={form.event_date}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>HORA DO EVENTO</Form.Label>
                  <Form.Control
                    type="time"
                    name="event_time"
                    value={form.event_time}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>DATA DO AVISO</Form.Label>
                  <Form.Control
                    type="date"
                    name="notice_date"
                    value={form.notice_date}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>HORA DO AVISO</Form.Label>
                  <Form.Control
                    type="time"
                    name="notice_time"
                    value={form.notice_time}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="6">
                  <Form.Label>LOCAL DO EVENTO</Form.Label>
                  <Form.Control
                    name="event_address"
                    value={form.event_address}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>UF / EVENTO</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    name="event_state"
                    value={form.event_state}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        event_state: e.target.value,
                        event_city: "",
                      }))
                    }
                  >
                    <option value="">Selecione...</option>
                    {states.map((uf) => (
                      <option key={uf.id} value={uf.sigla}>
                        {uf.nome} ({uf.sigla})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>CIDADE / EVENTO</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    name="event_city"
                    value={form.event_city}
                    onChange={setField}
                    disabled={!form.event_state}
                  >
                    <option value="">Selecione...</option>
                    {eventCities.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="3">
                  <Form.Label>LAT DO EVENTO</Form.Label>
                  <Form.Control
                    name="event_latitude"
                    value={form.event_latitude}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>LONG DO EVENTO</Form.Label>
                  <Form.Control
                    name="event_longitude"
                    value={form.event_longitude}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="4">
                  <Form.Label>TRANSPORTADOR</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    value={form.shipping_company}
                    onChange={(e) => {
                      const name = e.target.value;
                      const sc =
                        shippers.find((s) => s.company_name === name) || null;

                      // fallbacks: CNPJ pode estar em diferentes chaves
                      const cnpj = sc?.cnpj_cpf || sc?.cnpj || "";
                      const email = sc?.email || "";

                      setForm((f) => ({
                        ...f,
                        shipping_company: name,
                        shipping_company_cnpj: name ? cnpj : "",
                        shipping_company_email: name ? email : "",
                      }));
                    }}
                  >
                    <option value="">Selecione...</option>
                    {shippers.map((s) => (
                      <option key={s._id} value={s.company_name}>
                        {s.company_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>CNPJ</Form.Label>
                  <Form.Control
                    name="shipping_company_cnpj"
                    value={form.shipping_company_cnpj}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>e-mail</Form.Label>
                  <Form.Control
                    type="email"
                    name="shipping_company_email"
                    value={form.shipping_company_email}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="3">
                  <Form.Label>VEÍCULO/MARCA</Form.Label>
                  <Form.Control
                    name="vehicle_brand"
                    value={form.vehicle_brand}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>MODELO</Form.Label>
                  <Form.Control
                    name="vehicle_model"
                    value={form.vehicle_model}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>ANO</Form.Label>
                  <Form.Control
                    name="vehicle_year"
                    value={form.vehicle_year}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>PLACA</Form.Label>
                  <Form.Control
                    name="vehicle_plate"
                    value={form.vehicle_plate}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="3">
                  <Form.Label>CARRETA/MARCA</Form.Label>
                  <Form.Control
                    name="cart_brand"
                    value={form.cart_brand}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>MODELO</Form.Label>
                  <Form.Control
                    name="cart_model"
                    value={form.cart_model}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>ANO</Form.Label>
                  <Form.Control
                    name="cart_year"
                    value={form.cart_year}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>PLACA</Form.Label>
                  <Form.Control
                    name="cart_plate"
                    value={form.cart_plate}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="3">
                  <Form.Label>MOTORISTA</Form.Label>
                  <Form.Control
                    name="driver_name"
                    value={form.driver_name}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>CPF</Form.Label>
                  <Form.Control
                    name="driver_cpf"
                    value={form.driver_cpf}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>CNH</Form.Label>
                  <Form.Control
                    name="driver_cnh"
                    value={form.driver_cnh}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>DATA DE NASCIMENTO</Form.Label>
                  <Form.Control
                    name="birth_year"
                    value={form.birth_year}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="4">
                  <Form.Label>REMETENTE</Form.Label>
                  <Form.Control
                    name="sender_name"
                    value={form.sender_name}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>UF / ORIGEM</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    name="origin_state"
                    value={form.origin_state}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        origin_state: e.target.value,
                        origin_city: "",
                      }))
                    }
                  >
                    <option value="">Selecione...</option>
                    {states.map((uf) => (
                      <option key={uf.id} value={uf.sigla}>
                        {uf.nome} ({uf.sigla})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>CIDADE/ORIGEM</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    name="origin_city"
                    value={form.origin_city}
                    onChange={setField}
                    disabled={!form.origin_state}
                  >
                    <option value="">Selecione...</option>
                    {originCities.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="4">
                  <Form.Label>DESTINATÁRIO</Form.Label>
                  <Form.Control
                    name="receiver_name"
                    value={form.receiver_name}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>UF / DESTINO</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    name="destination_state"
                    value={form.destination_state}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        destination_state: e.target.value,
                        destination_city: "",
                      }))
                    }
                  >
                    <option value="">Selecione...</option>
                    {states.map((uf) => (
                      <option key={uf.id} value={uf.sigla}>
                        {uf.nome} ({uf.sigla})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>CIDADE/DESTINO</Form.Label>
                  <Form.Select
                    className="bg-dark text-white"
                    name="destination_city"
                    value={form.destination_city}
                    onChange={setField}
                    disabled={!form.destination_state}
                  >
                    <option value="">Selecione...</option>
                    {destinationCities.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="3">
                  <Form.Label>NOTA FISCAL</Form.Label>
                  <Form.Control
                    name="invoice_number"
                    value={form.invoice_number}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>VALOR</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="invoice_value"
                    value={form.invoice_value}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>MERCADORIA</Form.Label>
                  <Form.Control
                    name="goods"
                    value={form.goods}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>CLASSIFICAÇÃO DE RISCO</Form.Label>
                  <Form.Control
                    name="risk_classification"
                    value={form.risk_classification}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="3">
                  <Form.Label>CTE</Form.Label>
                  <Form.Control
                    name="cte_number"
                    value={form.cte_number}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>VALOR</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="cte_value"
                    value={form.cte_value}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>MDFE</Form.Label>
                  <Form.Control
                    name="mdfe_number"
                    value={form.mdfe_number}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="3">
                  <Form.Label>VALOR</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="mdfe_value"
                    value={form.mdfe_value}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="6">
                  <Form.Label>AVERBAÇÃO</Form.Label>
                  <Form.Control
                    name="averbacao_number"
                    value={form.averbacao_number}
                    onChange={setField}
                  />
                </Form.Group>
                <Form.Group as={Col} md="6">
                  <Form.Label>VALOR</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="averbacao_value"
                    value={form.averbacao_value}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group>
                  <Form.Label>DESCRIÇÃO DO EVENTO</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="event_description"
                    value={form.event_description}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group>
                  <Form.Label>OBSERVAÇÕES</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={form.notes}
                    onChange={setField}
                  />
                </Form.Group>
              </Row>

              <div className="d-flex gap-2">
                <Button type="submit" disabled={saving} className="btn-orange">
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/attendances")}
                >
                  Cancelar
                </Button>
              </div>
            </Form>
          </Tab>

          <Tab eventKey="followup" title="Follow-up">
            <div className="mb-2 text-muted">
              Data, hora e responsável são preenchidos automaticamente ao
              adicionar.
            </div>
            <div className="mb-3">
              <Row className="g-2">
                <Form.Group as={Col} md="8">
                  <Form.Label>AÇÕES / ACOMPANHAMENTO</Form.Label>
                  <Form.Control
                    value={fu.actions}
                    onChange={(e) =>
                      setFu((x) => ({ ...x, actions: e.target.value }))
                    }
                  />
                </Form.Group>
                <Form.Group as={Col} md="4">
                  <Form.Label>PRAZO RETORNO</Form.Label>
                  <Form.Control
                    type="date"
                    value={fu.return_date}
                    onChange={(e) =>
                      setFu((x) => ({ ...x, return_date: e.target.value }))
                    }
                  />
                </Form.Group>
              </Row>
              <div className="mt-2">
                <Button size="sm" onClick={addFollowup} className="btn-orange">
                  Adicionar
                </Button>
              </div>
            </div>

            <table className="table table-dark table-striped align-middle">
              <thead>
                <tr>
                  <th>DATA</th>
                  <th>HORA</th>
                  <th>AÇÕES / ACOMPANHAMENTO</th>
                  <th>RESPONSÁVEL</th>
                  <th>PRAZO DE RETORNO</th>
                  <th style={{ width: 80 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {form.followup.map((f, i) => {
                  const d = f.datetime ? new Date(f.datetime) : null;
                  return (
                    <tr key={i}>
                      <td>{d ? d.toLocaleDateString() : "—"}</td>
                      <td>
                        {d
                          ? d.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td>{f.actions}</td>
                      <td>{f.user || "—"}</td>
                      <td>
                        {f.return_date
                          ? new Date(f.return_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removeFollowup(i)}
                        >
                          Remover
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!form.followup.length && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      Nenhum registro de follow-up.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Tab>

          <Tab eventKey="files" title="Arquivos">
            <Alert variant="info" className="mb-2 alert-dark">
              Upload disponível após salvar o atendimento.
            </Alert>
            <table className="table table-dark table-bordered align-middle">
              <thead>
                <tr>
                  <th>Documento</th>
                  <th>Arquivo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d}>
                    <td>{d}</td>
                    <td>Pendente</td>
                    <td>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
};

export default AttendanceNew;
