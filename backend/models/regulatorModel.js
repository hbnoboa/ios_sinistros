const mongoose = require("mongoose");

const regulatorSchema = new mongoose.Schema(
  {
    name: { type: String },
    cnpj: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

module.exports = function getRegulatorModel(connection) {
  return (
    connection.models.Regulator ||
    connection.model("Regulator", regulatorSchema)
  );
};
