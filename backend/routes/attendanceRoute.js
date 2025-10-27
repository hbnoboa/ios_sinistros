const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const { getTenantConnection } = require("../utils/tenantManager");
const getAttendanceModel = require("../models/attendanceModel");

const {
  getAttendances,
  getAttendance,
  postAttendance,
  putAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

// Injeta model
router.use((req, res, next) => {
  const tenantId = req.headers["x-tenant-id"];
  if (!tenantId)
    return res.status(400).json({ error: "x-tenant-id header is required" });
  try {
    const conn = getTenantConnection(tenantId);
    req.AttendanceModel = getAttendanceModel(conn);
    next();
  } catch (e) {
    next(e);
  }
});

// Listar / obter (auth)
router.get("/", auth, getAttendances);
router.get("/:id", auth, getAttendance);

// Criar / atualizar / deletar (Admin ou Manager)
router.post("/", auth, requireRole("Admin", "Manager"), postAttendance);
router.put("/:id", auth, requireRole("Admin", "Manager"), putAttendance);
router.delete("/:id", auth, requireRole("Admin", "Manager"), deleteAttendance);

module.exports = router;
