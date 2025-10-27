const mongoose = require("mongoose");

const brokerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    state: { type: String },
    city: { type: String },
    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: undefined },
    },
  },
  { timestamps: true }
);

brokerSchema.index({ location: "2dsphere" });

module.exports = function getBrokerModel(connection) {
  return connection.models.Broker || connection.model("Broker", brokerSchema);
};
