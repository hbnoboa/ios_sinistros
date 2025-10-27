const express = require("express");
const auth = require("../middleware/auth");
const tenantGuard = require("../middleware/tenantGuard");
const requireRole = require("../middleware/role");
const { getTenantConnection } = require("../utils/tenantManager");
const { listAcrossTenants } = require("../utils/multiTenant");
const getRiskManagerModel = require("../models/riskManagerModel");

const {
  getRiskManagers: getRiskManagersController,
  getRiskManager: getRiskManagerController,
  postRiskManager,
  putRiskManager,
  deleteRiskManager,
} = require("../controllers/riskManagerController");

const router = express.Router();

// Injeta model (single-tenant)
router.use(auth, tenantGuard, (req, res, next) => {
  try {
    const conn = getTenantConnection(req.tenantId);
    req.RiskManagerModel = getRiskManagerModel(conn);
    next();
  } catch (e) {
    next(e);
  }
});

// GET / (suporta multi-tenant via query de tenants)
router.get("/", async (req, res, next) => {
  try {
    if (req.tenantsRequested.length > 1) {
      const data = await listAcrossTenants(req, {
        getModel: (conn) => getRiskManagerModel(conn),
        buildFilter: (r) => {
          const f = (r.query.filter || "").trim();
          return f
            ? {
                $or: [
                  { name: { $regex: f, $options: "i" } },
                  { cnpj: { $regex: f, $options: "i" } },
                  { email: { $regex: f, $options: "i" } },
                  { phone: { $regex: f, $options: "i" } },
                ],
              }
            : {};
        },
        sort: { name: 1 },
        select: null,
      });
      return res.json({
        riskManagers: data.items,
        tenants: data.tenants,
        perTenant: data.perTenantMeta,
        page: data.page,
        limit: data.limit,
      });
    }
    return getRiskManagersController(req, res);
  } catch (e) {
    next(e);
  }
});

// GET /:id (busca cross-tenant quando múltiplos tenants solicitados)
router.get("/:id", async (req, res, next) => {
  try {
    if (req.tenantsRequested.length > 1) {
      const tenants = req.tenantsRequested;
      const found = await (async () => {
        for (const t of tenants) {
          const m = getRiskManagerModel(getTenantConnection(t));
          // eslint-disable-next-line no-await-in-loop
          const doc = await m.findById(req.params.id).lean();
          if (doc) {
            doc._tenant = t;
            return doc;
          }
        }
        return null;
      })();
      if (!found) return res.status(404).json({ error: "Não encontrado" });
      return res.json(found);
    }
    return getRiskManagerController(req, res);
  } catch (e) {
    next(e);
  }
});

// Escritas (single-tenant)
router.post("/", requireRole("Admin", "Manager"), postRiskManager);
router.put("/:id", requireRole("Admin", "Manager"), putRiskManager);
router.delete("/:id", requireRole("Admin", "Manager"), deleteRiskManager);

module.exports = router;
