const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const getUserModel = require("../models/userModel");
const { getTenantConnection } = require("../utils/tenantManager");

function getUserModelForAuth(req) {
  const authTenant = process.env.AUTH_TENANT || "IOS";
  const conn = getTenantConnection(authTenant);
  return getUserModel(conn);
}

exports.signup = async (req, res) => {
  try {
    const User = getUserModelForAuth(req);
    const { email, password, name, role = "User", tenants = [] } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(409).json({ error: "Usuário já existe" });

    const hash = await bcrypt.hash(password, 10);
    const doc = await User.create({
      email,
      password: hash,
      name,
      role,
      tenants: Array.isArray(tenants) && tenants.length ? tenants : ["IOS"],
    });

    res.status(201).json({
      id: doc._id,
      email: doc.email,
      name: doc.name,
      role: doc.role,
      tenants: doc.tenants,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const User = getUserModelForAuth(req);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const tenants = Array.isArray(user.tenants) ? user.tenants : ["IOS"];
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      tenants,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    res.json({
      token,
      user: {
        id: payload.sub,
        email: user.email,
        name: user.name,
        role: payload.role,
      },
      tenants,
      defaultTenant: tenants[0],
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

exports.me = async (req, res) => {
  try {
    const { sub, email, name, role, tenants } = req.user || {};
    if (!sub) return res.status(401).json({ error: "Unauthorized" });
    return res.json({ id: sub, email, name, role, tenants });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
