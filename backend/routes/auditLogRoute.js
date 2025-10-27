const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const { getTenantConnection } = require("../utils/tenantManager");
const getAuditLogModel = require("../models/auditLogModel");

const router = express.Router();

// exige Admin/Manager e injeta o model por tenant
router.use(auth, requireRole("Admin", "Manager"));

router.use((req, res, next) => {
  const tenantId = req.headers["x-tenant-id"];
  if (!tenantId)
    return res.status(400).json({ error: "x-tenant-id header is required" });
  try {
    const conn = getTenantConnection(tenantId);
    req.AuditLog = getAuditLogModel(conn);
    next();
  } catch (e) {
    next(e);
  }
});

// Lista paginada
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      req.AuditLog.find().sort({ date: -1 }).skip(skip).limit(limit),
      req.AuditLog.estimatedDocumentCount(),
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    next(e);
  }
});

// Detalhe
router.get("/:id", async (req, res, next) => {
  try {
    const log = await req.AuditLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: "Log não encontrado" });
    res.json(log);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
