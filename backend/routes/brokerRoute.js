const express = require("express");
const auth = require("../middleware/auth");
const tenantGuard = require("../middleware/tenantGuard");
const requireRole = require("../middleware/role");
const { getTenantConnection } = require("../utils/tenantManager");
const { listAcrossTenants } = require("../utils/multiTenant");
const getBrokerModel = require("../models/brokerModel");

const {
  getBrokers: getBrokersController,
  getBroker: getBrokerController,
  postBroker,
  putBroker,
  deleteBroker,
} = require("../controllers/brokerController");

const router = express.Router();

// Injeta model single-tenant (para writes e GET simples)
router.use(auth, tenantGuard, (req, res, next) => {
  try {
    const conn = getTenantConnection(req.tenantId);
    req.BrokerModel = getBrokerModel(conn);
    next();
  } catch (e) {
    next(e);
  }
});

// GET / (multi-tenant suportado)
router.get("/", async (req, res, next) => {
  try {
    if (req.tenantsRequested.length > 1) {
      const data = await listAcrossTenants(req, {
        getModel: (conn) => getBrokerModel(conn),
        buildFilter: (r) =>
          r.query.filter && r.query.filter.trim()
            ? {
                $or: [
                  { email: { $regex: r.query.filter, $options: "i" } },
                  { city: { $regex: r.query.filter, $options: "i" } },
                  { state: { $regex: r.query.filter, $options: "i" } },
                ],
              }
            : {},
        sort: { email: 1 },
        select: null,
      });
      return res.json({
        brokers: data.items,
        tenants: data.tenants,
        perTenant: data.perTenantMeta,
        page: data.page,
        limit: data.limit,
      });
    }

    return getBrokersController(req, res);
  } catch (e) {
    next(e);
  }
});

// GET /:id (procura em múltiplos tenants quando solicitado)
router.get("/:id", async (req, res, next) => {
  try {
    if (req.tenantsRequested.length > 1) {
      const tenants = req.tenantsRequested;
      const found = await (async () => {
        for (const t of tenants) {
          const m = getBrokerModel(getTenantConnection(t));
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

    return getBrokerController(req, res);
  } catch (e) {
    next(e);
  }
});

// Writes (apenas single-tenant; já garantido pelo tenantGuard)
router.post("/", requireRole("Admin", "Manager"), postBroker);
router.put("/:id", requireRole("Admin", "Manager"), putBroker);
router.delete("/:id", requireRole("Admin", "Manager"), deleteBroker);

module.exports = router;
