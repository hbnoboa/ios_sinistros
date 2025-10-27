const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: String, // email ou id do usuário
  action: String, // "POST", "PUT", "PATCH", "DELETE"
  route: String, // rota acessada
  field: String, // id ou campo afetado
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  status: Number, // status HTTP da resposta
  date: { type: Date, default: Date.now },
  ip: String,
});

auditLogSchema.index({ date: -1 });

module.exports = function getAuditLogModel(connection) {
  return (
    connection.models.AuditLog || connection.model("AuditLog", auditLogSchema)
  );
};
