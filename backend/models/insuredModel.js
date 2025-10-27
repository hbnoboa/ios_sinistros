const mongoose = require("mongoose");

const insuredSchema = new mongoose.Schema(
  {
    company_name: { type: String },
    fantasy_name: { type: String },
    cnpj: { type: String },
    email: { type: String },
    state: { type: String },
    city: { type: String },
    address: { type: String },
    business_field: { type: String },
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

// Índice 2dsphere para consultas $near
insuredSchema.index({ location: "2dsphere" });

module.exports = function getInsuredModel(connection) {
  return (
    connection.models.Insured || connection.model("Insured", insuredSchema)
  );
};
