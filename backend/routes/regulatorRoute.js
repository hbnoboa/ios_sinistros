const express = require("express");
const auth = require("../middleware/auth");
const tenantGuard = require("../middleware/tenantGuard");
const requireRole = require("../middleware/role");
const { getTenantConnection } = require("../utils/tenantManager");
const getRegulatorModel = require("../models/regulatorModel");
const {
  getRegulators,
  getRegulator,
  postRegulator,
  putRegulator,
  deleteRegulator,
} = require("../controllers/regulatorController");

const router = express.Router();

// Injeta model por tenant (sem vínculo com attendance)
router.use(auth, tenantGuard, (req, res, next) => {
  try {
    const conn = getTenantConnection(req.tenantId);
    req.RegulatorModel = getRegulatorModel(conn);
    next();
  } catch (e) {
    next(e);
  }
});

// Listar e obter
router.get("/", getRegulators);
router.get("/:id", getRegulator);

// Escritas
router.post("/", requireRole("Admin", "Manager"), postRegulator);
router.put("/:id", requireRole("Admin", "Manager"), putRegulator);
router.delete("/:id", requireRole("Admin", "Manager"), deleteRegulator);

module.exports = router;
