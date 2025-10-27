const mongoose = require("mongoose");

const connections = new Map();

function getTenantConnection(tenantId) {
  if (connections.has(tenantId)) return connections.get(tenantId);

  const uri = `${process.env.MONGO_BASE_URI}${tenantId}${process.env.MONGO_LAST_URI}`;
  const connection = mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  connections.set(tenantId, connection);
  return connection;
}

function getTenantConnections(tenantIds = []) {
  return tenantIds.map((id) => ({ id, conn: getTenantConnection(id) }));
}

module.exports = { getTenantConnection, getTenantConnections };
