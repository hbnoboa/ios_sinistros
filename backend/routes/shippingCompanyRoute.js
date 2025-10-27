const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const { getTenantConnection } = require("../utils/tenantManager");
const getShippingCompanyModel = require("../models/shippingCompanyModel");

const {
  getShippingCompanies,
  getShippingCompany,
  postShippingCompany,
  putShippingCompany,
  deleteShippingCompany,
} = require("../controllers/shippingCompanyController");

const router = express.Router();

// Injeta model baseado no tenant
router.use((req, res, next) => {
  const tenantId = req.headers["x-tenant-id"];
  if (!tenantId)
    return res.status(400).json({ error: "x-tenant-id header is required" });
  try {
    const conn = getTenantConnection(tenantId);
    req.ShippingCompanyModel = getShippingCompanyModel(conn);
    next();
  } catch (e) {
    next(e);
  }
});

// Listar (qualquer usuário autenticado)
router.get("/", auth, getShippingCompanies);
router.get("/:id", auth, getShippingCompany);

// Criar / Atualizar / Deletar (Admin ou Manager)
router.post("/", auth, requireRole("Admin", "Manager"), postShippingCompany);
router.put("/:id", auth, requireRole("Admin", "Manager"), putShippingCompany);
router.delete(
  "/:id",
  auth,
  requireRole("Admin", "Manager"),
  deleteShippingCompany
);

module.exports = router;
