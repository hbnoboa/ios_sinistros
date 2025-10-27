import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  Row,
  Col,
  ListGroup,
  Button,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";

const API = "/api/attendances";

const documents = [
  "NF",
  "CTE",
  "MDFE",
  "AVERBAÇÃO",
  "CNH",
  "BOLETIM DE OCORRÊNCIA",
  "DECLARAÇÃO DO MOTORISTA",
  "DOCUMENTOS DO VEÍCULO",
  "TACÓGRAFO",
  "DOCUMENTO DE TERCEIROS",
  "FOTOS DO SINISTRO",
  "RELATÓRIOS DE MONITORAMENTO",
  "RELATÓRIO DA REGULADORA",
];

// Helpers para Decimal128 -> string
const decToStr = (v) =>
  v && typeof v === "object" && "$numberDecimal" in v ? v.$numberDecimal : v;
const showVal = (v) => {
  const s = decToStr(v);
  return s != null && s !== "" ? s : "—";
};

const AttendanceShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [key, setKey] = useState("cadastro");

  const token = localStorage.getItem("token");
  const tenant = localStorage.getItem("tenant") || "IOS";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API}/${id}`, {
          headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data?.error || "Erro ao carregar atendimento");
        setItem(data);
        const fr = await fetch(`${API}/${id}/files`, {
          headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
        });
        const filesData = await fr.json();
        setFiles(Array.isArray(filesData) ? filesData : []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token, tenant]);

  const onDelete = async () => {
    if (!window.confirm("Deseja realmente excluir este atendimento?")) return;
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Erro ao excluir");
      navigate("/attendances");
    } catch (e) {
      alert(e.message);
    }
  };

  const downloadFile = async (f) => {
    try {
      const res = await fetch(
        `${API}/${id}/files/${encodeURIComponent(f.filename)}`,
        { headers: { Authorization: `Bearer ${token}`, "x-tenant-id": tenant } }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Erro ao baixar arquivo");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.originalname || f.filename || "arquivo";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" /> Carregando...
      </div>
    );
  }
  if (err) return <Alert variant="danger">{err}</Alert>;
  if (!item)
    return <Alert variant="warning">Atendimento não encontrado.</Alert>;

  const fileByCategory = (cat) =>
    files.find((f) => (f.category || "").toLowerCase() === cat.toLowerCase());

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Atendimento</h2>
        <div className="d-flex gap-2">
          <Button as={Link} to={`/attendances/${id}/edit`} className="btn-dark">
            <img
              src="/icons/edit.png"
              alt="Editar"
              style={{
                height: 30,
                display: "block",
                filter: "invert(1)",
              }}
            />
          </Button>
          <Button className="btn-dark" onClick={onDelete}>
            <img
              src="/icons/delete.png"
              alt="EditDeletar"
              style={{
                height: 30,
                display: "block",
                filter: "invert(1)",
              }}
            />
          </Button>
          <Button as={Link} to="/attendances" className="btn-dark">
            <img
              src="/icons/back.png"
              alt="Voltar"
              style={{
                height: 30,
                display: "block",
                filter: "invert(1)",
              }}
            />
          </Button>
        </div>
      </div>

      <Card className="bg-dark text-white" style={{ borderColor: "#444" }}>
        <Card.Body>
          <Tabs
            activeKey={key}
            onSelect={(k) => setKey(k || "cadastro")}
            className="mb-3 orange-tabs"
            fill
          >
            <Tab eventKey="cadastro" title="Cadastro">
              <Row>
                <Col md={6}>
                  <ListGroup variant="flush" className="list-group-dark">
                    <ListGroup.Item>
                      <strong>Corretor:</strong> {item.broker_name || "—"} (
                      {item.broker_email || "—"})
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Seguradora:</strong>{" "}
                      {item.insurance_company_name || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Segurado:</strong> {item.insured_name || "—"} |
                      CNPJ: {item.insured_cnpj || "—"} |{" "}
                      {item.insured_email || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Apólice:</strong> {item.policy_number || "—"} |
                      Ramo: {item.line_of_business || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Reguladora:</strong> {item.regulatory || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Gerenc. de Riscos:</strong>{" "}
                      {item.risk_manager || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Sinistro Seguradora:</strong>{" "}
                      {item.insurance_claim_number || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Sinistro Reguladora:</strong>{" "}
                      {item.regulator_claim_number || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Estimativa:</strong>{" "}
                      {showVal(item.loss_estimation)} |{" "}
                      <strong>Franquia:</strong> {showVal(item.deductible)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>POS:</strong> {item.pos || "—"}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                <Col md={6}>
                  <ListGroup variant="flush" className="list-group-dark">
                    <ListGroup.Item>
                      <strong>Fixado:</strong> {showVal(item.fixed_loss)} |{" "}
                      <strong>Indenizado:</strong>{" "}
                      {showVal(item.indemnified_loss)} |{" "}
                      <strong>Finalização:</strong>{" "}
                      {item.closing_date
                        ? new Date(item.closing_date).toLocaleDateString()
                        : "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Causa:</strong> {item.cause || "—"} |{" "}
                      <strong>Tipo:</strong> {item.cause_type || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Evento:</strong>{" "}
                      {item.event_date
                        ? new Date(item.event_date).toLocaleDateString()
                        : "—"}{" "}
                      {item.event_time ? ` ${item.event_time}` : ""} |{" "}
                      <strong>Aviso:</strong>{" "}
                      {item.notice_date
                        ? new Date(item.notice_date).toLocaleDateString()
                        : "—"}{" "}
                      {item.notice_time ? ` ${item.notice_time}` : ""}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Local:</strong> {item.event_address || "—"} -{" "}
                      {item.event_city || "—"}/{item.event_state || "—"} |{" "}
                      <strong>Lat/Long:</strong> {showVal(item.event_latitude)}{" "}
                      / {showVal(item.event_longitude)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Transportador:</strong>{" "}
                      {item.shipping_company || "—"} | CNPJ:{" "}
                      {item.shipping_company_cnpj || "—"} |{" "}
                      {item.shipping_company_email || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Veículo:</strong> {item.vehicle_brand || "—"}{" "}
                      {item.vehicle_model || ""} {item.vehicle_year || ""} |
                      Placa: {item.vehicle_plate || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Carreta:</strong> {item.cart_brand || "—"}{" "}
                      {item.cart_model || ""} {item.cart_year || ""} | Placa:{" "}
                      {item.cart_plate || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Motorista:</strong> {item.driver_name || "—"} |
                      CPF: {item.driver_cpf || "—"} | CNH:{" "}
                      {item.driver_cnh || "—"} | Nascimento:{" "}
                      {item.birth_year || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Remetente:</strong> {item.sender_name || "—"} |
                      Origem: {item.origin_city || "—"}/
                      {item.origin_state || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Destinatário:</strong> {item.receiver_name || "—"}{" "}
                      | Destino: {item.destination_city || "—"}/
                      {item.destination_state || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>NF:</strong> {item.invoice_number || "—"} | Valor:{" "}
                      {showVal(item.invoice_value)} | Mercadoria:{" "}
                      {item.goods || "—"} | Class. Risco:{" "}
                      {item.risk_classification || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>CTE:</strong> {item.cte_number || "—"} | Valor:{" "}
                      {showVal(item.cte_value)} | <strong>MDFE:</strong>{" "}
                      {item.mdfe_number || "—"} | Valor:{" "}
                      {showVal(item.mdfe_value)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Averbação:</strong> {item.averbacao_number || "—"}{" "}
                      | Valor: {showVal(item.averbacao_value)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Descrição do Evento:</strong>{" "}
                      {item.event_description || "—"}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Observações:</strong> {item.notes || "—"}
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Tab>

            <Tab eventKey="followup" title="Follow-up">
              <table className="table table-dark table-striped align-middle">
                <thead>
                  <tr>
                    <th>DATA</th>
                    <th>HORA</th>
                    <th>AÇÕES / ACOMPANHAMENTO</th>
                    <th>RESPONSÁVEL</th>
                    <th>PRAZO DE RETORNO</th>
                  </tr>
                </thead>
                <tbody>
                  {(item.followup || []).map((f, i) => {
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
                      </tr>
                    );
                  })}
                  {!item.followup?.length && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        Nenhum registro de follow-up.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Tab>

            <Tab eventKey="files" title="Arquivos">
              <table className="table table-dark table-bordered align-middle">
                <thead>
                  <tr>
                    <th>DOCUMENTAÇÃO</th>
                    <th>ARQUIVO</th>
                    <th>DATA</th>
                    <th style={{ width: 160 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((cat) => {
                    const f = fileByCategory(cat);
                    return (
                      <tr key={cat}>
                        <td>{cat}</td>
                        <td>
                          {f ? (
                            <span
                              className="text-truncate d-inline-block"
                              style={{ maxWidth: 280 }}
                              title={f.originalname || f.filename}
                            >
                              {f.originalname || f.filename}
                            </span>
                          ) : (
                            <Badge bg="secondary">Pendente</Badge>
                          )}
                        </td>
                        <td>
                          {f?.datetime
                            ? new Date(f.datetime).toLocaleString()
                            : "—"}
                        </td>
                        <td>
                          {f ? (
                            <Button
                              size="sm"
                              className="btn-orange"
                              onClick={() => downloadFile(f)}
                            >
                              Baixar
                            </Button>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AttendanceShow;
