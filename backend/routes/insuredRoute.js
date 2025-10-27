const express = require("express");
const auth = require("../middleware/auth");
const tenantGuard = require("../middleware/tenantGuard");
const requireRole = require("../middleware/role");
const { getTenantConnection } = require("../utils/tenantManager");
const { listAcrossTenants } = require("../utils/multiTenant");
const getInsuredModel = require("../models/insuredModel");

const {
  getInsureds: getInsuredsController,
  getInsured: getInsuredController,
  postInsured,
  putInsured,
  deleteInsured,
} = require("../controllers/insuredController");

const router = express.Router();

// Injeta model single-tenant (para writes e GET simples)
router.use(auth, tenantGuard, (req, res, next) => {
  try {
    const conn = getTenantConnection(req.tenantId);
    req.InsuredModel = getInsuredModel(conn);
    next();
  } catch (e) {
    next(e);
  }
});

// GET / (multi-tenant suportado)
router.get("/", async (req, res, next) => {
  try {
    // múltiplos tenants: agrega no próprio route
    if (req.tenantsRequested.length > 1) {
      const data = await listAcrossTenants(req, {
        getModel: (conn) => getInsuredModel(conn),
        buildFilter: (r) =>
          r.query.filter
            ? { fantasy_name: { $regex: r.query.filter, $options: "i" } }
            : {},
        sort: { fantasy_name: 1 },
        select: null,
      });
      return res.json({
        insureds: data.items,
        tenants: data.tenants,
        perTenant: data.perTenantMeta,
        page: data.page,
        limit: data.limit,
      });
    }

    // single-tenant: delega ao controller existente
    return getInsuredsController(req, res);
  } catch (e) {
    next(e);
  }
});

// GET /:id (procura em múltiplos tenants)
router.get("/:id", async (req, res, next) => {
  try {
    if (req.tenantsRequested.length > 1) {
      const tenants = req.tenantsRequested;
      const { getTenantConnection } = require("../utils/tenantManager");
      const found = await (async () => {
        for (const t of tenants) {
          const m = getInsuredModel(getTenantConnection(t));
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

    return getInsuredController(req, res);
  } catch (e) {
    next(e);
  }
});

router.post("/", requireRole("Admin", "Manager"), postInsured);
router.put("/:id", requireRole("Admin", "Manager"), putInsured);
router.delete("/:id", requireRole("Admin", "Manager"), deleteInsured);

module.exports = router;
