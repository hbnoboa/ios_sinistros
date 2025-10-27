const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordSentAt: { type: Date },
    name: { type: String },
    role: {
      type: String,
      enum: ["Admin", "Manager", "Operator", "User"],
      default: "User",
    },
    tenants: [String],
  },
  { timestamps: true }
);

module.exports = function getUserModel(connection) {
  return connection.models.User || connection.model("User", userSchema);
};
