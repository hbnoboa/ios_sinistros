const express = require("express");
const auth = require("../middleware/auth");
const tenantGuard = require("../middleware/tenantGuard");
const requireRole = require("../middleware/role");
const { getTenantConnection } = require("../utils/tenantManager");
const { listAcrossTenants } = require("../utils/multiTenant");
const getInsuranceCompanyModel = require("../models/insuranceCompanyModel");

const {
  getInsuranceCompanies: getInsuranceCompaniesController,
  getInsuranceCompany: getInsuranceCompanyController,
  postInsuranceCompany,
  putInsuranceCompany,
  deleteInsuranceCompany,
} = require("../controllers/insuranceCompanyController");

const router = express.Router();

// Injeta model single-tenant (para writes e GET simples)
router.use(auth, tenantGuard, (req, res, next) => {
  try {
    const conn = getTenantConnection(req.tenantId);
    req.InsuranceCompanyModel = getInsuranceCompanyModel(conn);
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
        getModel: (conn) => getInsuranceCompanyModel(conn),
        buildFilter: (r) => {
          const f = (r.query.filter || "").trim();
          return f
            ? {
                $or: [
                  { company_name: { $regex: f, $options: "i" } },
                  { cnpj: { $regex: f, $options: "i" } },
                  { email: { $regex: f, $options: "i" } },
                  { city: { $regex: f, $options: "i" } },
                  { state: { $regex: f, $options: "i" } },
                ],
              }
            : {};
        },
        sort: { company_name: 1 },
        select: null,
      });
      return res.json({
        insuranceCompanies: data.items,
        tenants: data.tenants,
        perTenant: data.perTenantMeta,
        page: data.page,
        limit: data.limit,
      });
    }

    return getInsuranceCompaniesController(req, res);
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
          const m = getInsuranceCompanyModel(getTenantConnection(t));
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

    return getInsuranceCompanyController(req, res);
  } catch (e) {
    next(e);
  }
});

// Writes (apenas single-tenant; já garantido pelo tenantGuard)
router.post("/", requireRole("Admin", "Manager"), postInsuranceCompany);
router.put("/:id", requireRole("Admin", "Manager"), putInsuranceCompany);
router.delete("/:id", requireRole("Admin", "Manager"), deleteInsuranceCompany);

module.exports = router;
