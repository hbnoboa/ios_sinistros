const mongoose = require("mongoose");

const shippingCompanySchema = new mongoose.Schema(
  {
    company_name: { type: String, required: true },
    cnpj_cpf: { type: String },
    rntrc: { type: String },
    drivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Driver" }],
  },
  { timestamps: true }
);

module.exports = function getShippingCompanyModel(connection) {
  return (
    connection.models.ShippingCompany ||
    connection.model("ShippingCompany", shippingCompanySchema)
  );
};
