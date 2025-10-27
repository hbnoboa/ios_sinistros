import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Lista dos campos principais do atendimento
const fields = [
  { label: "Data do Atendimento", key: "attendance_date" },
  { label: "Status", key: "event_status" },
  { label: "Seguradora", key: "insured_company" },
  { label: "Nome do Segurado", key: "insured_name" },
  { label: "Nome da Filial", key: "branch_name" },
  {
    label: "Fast Track",
    key: "fast_track",
    format: (v) => (v ? "Sim" : "Não"),
  },
  { label: "Nome do Comunicante", key: "comunicator_name" },
  { label: "Contato do Comunicante", key: "communicator_contact" },
  { label: "Tipo de Operação", key: "operation_type" },
  { label: "Número do Manifesto", key: "manifest_number" },
  {
    label: "Número do Conhecimento de Transporte",
    key: "transport_knowledge_number",
  },
  { label: "Número da Nota Fiscal", key: "invoice_number" },
  { label: "Reguladora", key: "regulatory" },
  { label: "Natureza do Evento", key: "event_nature" },
  { label: "Tipo de Natureza do Evento", key: "event_nature_type" },
  { label: "Carga Transportada", key: "transported_load" },
  { label: "Valor da Carga", key: "load_value" },
  { label: "Valor Segurado", key: "insurance_value" },
  { label: "Estimativa de Prejuízo", key: "loss_estimation" },
  { label: "Valor Recuperado", key: "saved_value" },
  { label: "Transportadora", key: "shipping_company" },
  { label: "CNPJ Transportadora", key: "shipping_company_cnpj" },
  { label: "Nome do Motorista", key: "driver_name" },
  {
    label: "Placas",
    key: "plates",
    format: (v) => (Array.isArray(v) ? v.join(", ") : v),
  },
  { label: "Origem - Estado", key: "origin_state" },
  { label: "Origem - Cidade", key: "origin_city" },
  { label: "Destino - Estado", key: "destination_state" },
  { label: "Destino - Cidade", key: "destination_city" },
  { label: "Estado do Evento", key: "event_state" },
  { label: "Cidade do Evento", key: "event_city" },
  { label: "Endereço do Evento", key: "event_address" },
  { label: "KM", key: "n_km" },
  { label: "Latitude", key: "latitude" },
  { label: "Longitude", key: "longitude" },
  { label: "Data/Hora do Acidente", key: "date_time_accident" },
  { label: "Registro", key: "register" },
  { label: "Sinistro", key: "insurance_claim" },
  { label: "Descrição", key: "description" },
];

// Lista dos campos de anexos
const attachmentFields = [
  "averbacao_filename",
  "aviso_sinistro_filename",
  "antt_filename",
  "conhecimento_transporte_filename",
  "nota_fiscal_filename",
  "manifesto_filename",
  "documento_motorista_filename",
  "documento_veiculo_filename",
  "ficha_cadastro_interno_filename",
  "contrato_transporte_filename",
  "boletim_ocorrencia_filename",
  "boletim_saque_filename",
  "comprovante_entrega_filename",
  "ticket_pesagem_filename",
  "comprovante_venda_salvados_filename",
  "declaracao_nao_recebimento_filename",
  "declaracao_motorista_filename",
  "discos_cronotacografo_filename",
  "consulta_gr_filename",
  "ordem_carregamento_filename",
  "relatorio_rastreamento_filename",
  "nota_debito_filename",
  "comprovante_pagamento_nd_filename",
  "comprovante_pagamento_seguradora_filename",
];

function formatValue(value) {
  if (!value) return "";
  if (typeof value === "object" && value.$numberDecimal)
    return value.$numberDecimal;
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  return value;
}

export function generateAttendancePDF(
  attendance,
  regulators = [],
  victims = [],
  interactions = []
) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Atendimento ${attendance._id}`, 14, 18);

  // Tabela principal
  const tableData = fields.map((f) => [
    f.label,
    f.format ? f.format(attendance[f.key]) : formatValue(attendance[f.key]),
  ]);

  autoTable(doc, {
    startY: 24,
    head: [["Campo", "Valor"]],
    body: tableData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 120 },
    },
  });

  let y = doc.lastAutoTable.finalY + 8;

  // Reguladores
  if (regulators && regulators.length > 0) {
    doc.setFontSize(14);
    doc.text("Reguladores", 14, y);
    y += 4;

    regulators.forEach((reg, idx) => {
      autoTable(doc, {
        startY: y,
        head: [[`Regulador ${idx + 1}`, "Valor"]],
        body: [
          [
            "Data Autorização",
            reg.authDate ? new Date(reg.authDate).toLocaleString("pt-BR") : "",
          ],
          ["Contratante", reg.contractor || ""],
          [
            "Recuperado/Localizado",
            reg.recovered === true || reg.recovered === "true"
              ? "Sim"
              : reg.recovered === false || reg.recovered === "false"
              ? "Não"
              : "",
          ],
          [
            "Previsão Chegada Prestador",
            reg.estimatedArrivalDate
              ? new Date(reg.estimatedArrivalDate).toLocaleString("pt-BR")
              : "",
          ],
          [
            "Data Chegada Prestador",
            reg.arrivalDate
              ? new Date(reg.arrivalDate).toLocaleString("pt-BR")
              : "",
          ],
          [
            "Data Finalização",
            reg.finalDate
              ? new Date(reg.finalDate).toLocaleString("pt-BR")
              : "",
          ],
          ["Nome Prestador", reg.serviceProvider || ""],
          ["Local", reg.place || ""],
          ["KM", reg.km || ""],
          ["Horas Paradas", reg.standingTime || ""],
          ["Observações", reg.observation || ""],
          [
            "Anexos",
            Array.isArray(reg.Attachments_filename) &&
            reg.Attachments_filename.length > 0
              ? "Sim"
              : "Não",
          ],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [52, 152, 219] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 4;
    });
  }

  // Vítimas
  if (victims && victims.length > 0) {
    doc.setFontSize(14);
    doc.text("Vítimas", 14, y);
    y += 4;

    victims.forEach((victim, idx) => {
      autoTable(doc, {
        startY: y,
        head: [[`Vítima ${idx + 1}`, "Valor"]],
        body: [
          ["Vítima?", victim.victim ? "Sim" : "Não"],
          ["Vítima Fatal?", victim.fatal_victim ? "Sim" : "Não"],
          ["Motorista Vítima", victim.driver_victim || ""],
          ["Terceiro Vítima", victim.third_party_victim || ""],
          ["Motorista Vítima Fatal", victim.fatal_driver_victim || ""],
          ["Terceiro Vítima Fatal", victim.fatal_third_party_victim || ""],
          ["Culpabilidade", victim.culpability ? "Sim" : "Não"],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [231, 76, 60] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 4;
    });
  }

  // Interações
  if (interactions && interactions.length > 0) {
    doc.setFontSize(14);
    doc.text("Interações", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Data", "Descrição"]],
      body: interactions.map((i) => [
        i.createdAt ? new Date(i.createdAt).toLocaleString("pt-BR") : "",
        i.description || "",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [39, 174, 96] },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // Anexos principais
  doc.setFontSize(14);
  doc.text("Anexos", 14, y);
  y += 4;

  const anexosTable = attachmentFields.map((field) => [
    field.replace(/_/g, " ").replace("filename", "").toUpperCase(),
    attendance[field] && attendance[field].length > 0 ? "Sim" : "Não",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Tipo de Anexo", "Possui?"]],
    body: anexosTable,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [155, 89, 182] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`Atendimento_${attendance._id}.pdf`);
}
