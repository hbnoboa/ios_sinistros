const mongoose = require("mongoose");

const insuranceCompanySchema = new mongoose.Schema(
  {
    company_name: { type: String },
    cnpj: { type: String },
    phone: { type: String },
    email: { type: String },
    state: { type: String },
    city: { type: String },
    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
  },
  { timestamps: true }
);

insuranceCompanySchema.index({ location: "2dsphere" });

module.exports = function getInsuranceCompanyModel(connection) {
  return (
    connection.models.InsuranceCompany ||
    connection.model("InsuranceCompany", insuranceCompanySchema)
  );
};
