const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    broker_name: String,
    broker_email: String,
    insurance_company_name: String,
    insured_name: String,
    insured_cnpj: String,
    insured_email: String,
    policy_number: String,
    line_of_business: String,
    regulatory: String,
    risk_manager: String,
    insurance_claim_number: String, // número do sinistro seguradora
    regulator_claim_number: String, // número do sinistro reguladora
    loss_estimation: mongoose.Schema.Types.Decimal128, // estimativa de prejuízo
    deductible: mongoose.Schema.Types.Decimal128, // franquia
    pos: String, // POS (mantido como texto por não haver especificação)
    fixed_loss: mongoose.Schema.Types.Decimal128, // prejuízo fixado
    indemnified_loss: mongoose.Schema.Types.Decimal128, // prejuízo indenizado
    closing_date: Date, // data de finalização
    cause: String,
    cause_type: String,
    event_date: Date,
    event_time: String,
    notice_date: Date,
    notice_time: String,
    event_address: String,
    event_city: String,
    event_state: String,
    event_latitude: Number,
    event_longitude: Number,
    shipping_company: String,
    shipping_company_cnpj: String,
    shipping_company_email: String,
    vehicle_brand: String,
    vehicle_model: String,
    vehicle_year: String,
    vehicle_plate: String,
    cart_brand: String,
    cart_model: String,
    cart_year: String,
    cart_plate: String,
    driver_name: String,
    driver_cpf: String,
    driver_cnh: String,
    birth_year: String,
    sender_name: String,
    origin_city: String,
    origin_state: String,
    receiver_name: String,
    destination_city: String,
    destination_state: String,
    invoice_number: String,
    invoice_value: mongoose.Schema.Types.Decimal128,
    goods: String,
    risk_classification: String,
    cte_number: String,
    cte_value: mongoose.Schema.Types.Decimal128,
    mdfe_number: String,
    mdfe_value: mongoose.Schema.Types.Decimal128,
    averbacao_number: String,
    averbacao_value: mongoose.Schema.Types.Decimal128,
    event_description: String,
    notes: String,
    followup: [
      {
        datetime: Date,
        actions: String,
        user: String,
        return_date: Date,
      },
    ],
    files: [
      {
        datetime: Date,
        category: String,
        originalname: String,
        filename: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = function getAttendanceModel(connection) {
  return (
    connection.models.Attendance ||
    connection.model("Attendance", attendanceSchema)
  );
};
