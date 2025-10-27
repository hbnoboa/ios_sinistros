const { getTenantConnection } = require("../utils/tenantManager");
const getAuditLogModel = require("../models/auditLogModel");

module.exports = (req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();

  // Redator genérico para campos sensíveis
  const SENSITIVE_KEYS = new Set([
    "password",
    "currentPassword",
    "newPassword",
    "confirmPassword",
    "resetPasswordToken",
    "confirmationToken",
    "token", // se não quiser, remova este
  ]);
  const redact = (val) => {
    if (Array.isArray(val)) return val.map(redact);
    if (val && typeof val === "object") {
      const out = {};
      for (const [k, v] of Object.entries(val)) {
        out[k] = SENSITIVE_KEYS.has(k) ? "[REDACTED]" : redact(v);
      }
      return out;
    }
    return val;
  };

  const originalSend = res.send;

  res.send = async function (body) {
    try {
      const tenantId = req.headers["x-tenant-id"];
      if (tenantId) {
        const conn = getTenantConnection(tenantId);
        const AuditLog = getAuditLogModel(conn);

        const user = req.user?.email || req.body?.email || "desconhecido";
        const ip =
          req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip;
        const field = req.params?.id || req.params?.key || req.originalUrl;
        const status = res.statusCode;

        const shouldCaptureBody = ["POST", "PUT", "PATCH"].includes(req.method);
        const rawNewValue =
          shouldCaptureBody && req.body && typeof req.body === "object"
            ? req.body
            : undefined;

        // Mascara campos sensíveis (ex.: password no signin/signup)
        const newValue = rawNewValue ? redact(rawNewValue) : undefined;

        await AuditLog.create({
          user,
          action: req.method,
          route: req.originalUrl,
          field,
          oldValue: undefined,
          newValue,
          status,
          date: new Date(),
          ip,
        });
      }
    } catch (err) {
      console.error("Erro ao salvar audit log:", err);
    }
    return originalSend.apply(this, arguments);
  };

  next();
};
