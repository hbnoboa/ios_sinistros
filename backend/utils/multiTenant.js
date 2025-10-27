const { getTenantConnections } = require("./tenantManager");

async function listAcrossTenants(
  req,
  { getModel, buildFilter, sort = {}, select = null }
) {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const tenants =
    req.tenantsRequested && req.tenantsRequested.length
      ? req.tenantsRequested
      : [req.tenantId];

  const conns = getTenantConnections(tenants);

  const perTenant = await Promise.all(
    conns.map(async ({ id, conn }) => {
      const Model = getModel(conn);
      const filter = buildFilter ? buildFilter(req) : {};
      const q = Model.find(filter).sort(sort).skip(skip).limit(limit);
      if (select) q.select(select);
      const [items, total] = await Promise.all([
        q.lean(),
        Model.countDocuments(filter),
      ]);
      items.forEach((it) => (it._tenant = id));
      return { tenant: id, items, total };
    })
  );

  return {
    tenants,
    perTenantMeta: perTenant.map((r) => ({ tenant: r.tenant, total: r.total })),
    items: perTenant.flatMap((r) => r.items),
    page,
    limit,
  };
}

async function findOneAcrossTenants({ tenants, getModel, id }) {
  for (const tenant of tenants) {
    const Model = getModel(tenant);
    // eslint-disable-next-line no-await-in-loop
    const doc = await Model.findById(id).lean();
    if (doc) {
      doc._tenant = tenant;
      return doc;
    }
  }
  return null;
}

module.exports = { listAcrossTenants, findOneAcrossTenants };
