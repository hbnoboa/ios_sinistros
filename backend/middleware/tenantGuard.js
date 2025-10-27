module.exports = (req, res, next) => {
  const header = req.headers["x-tenant-id"];
  if (!header)
    return res.status(400).json({ error: "x-tenant-id header is required" });

  const requested = header
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!requested.length)
    return res.status(400).json({ error: "x-tenant-id inválido" });

  // Admin tem acesso a todos
  if (req.user?.role !== "Admin") {
    const allowed = Array.isArray(req.user?.tenants) ? req.user.tenants : [];
    const notAllowed = requested.filter((t) => !allowed.includes(t));
    if (notAllowed.length) {
      return res
        .status(403)
        .json({ error: "Acesso negado ao tenant", details: notAllowed });
    }
  }

  // Writes só com um tenant
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    requested.length > 1
  ) {
    return res.status(400).json({
      error: "Operações de escrita aceitam apenas um tenant no x-tenant-id",
    });
  }

  req.tenantsRequested = requested;
  req.tenantId = requested[0]; // compatibilidade com código existente
  next();
};
