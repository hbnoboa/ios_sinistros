const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");
const getUserModel = require("../models/userModel.js");
const { getTenantConnection } = require("../utils/tenantManager.js");
const { signup, signin, me } = require("../controllers/authController");

const router = express.Router();

// Middleware para injetar Model do tenant
router.use((req, res, next) => {
  const tenantId = req.headers["x-tenant-id"];
  if (!tenantId) {
    return res.status(400).json({ error: "x-tenant-id header is required" });
  }
  try {
    const connection = getTenantConnection(tenantId);
    req.UserModel = getUserModel(connection);
    next();
  } catch (err) {
    next(err);
  }
});

// Rotas públicas de auth dentro de /users
router.post("/signup", signup);
router.post("/signin", signin);

// LISTAR usuários (Admin ou Manager)
router.get(
  "/",
  auth,
  requireRole("Admin", "Manager"),
  async (req, res, next) => {
    try {
      const users = await req.UserModel.find().select("-password");
      res.json(users);
    } catch (e) {
      next(e);
    }
  }
);

// CRIAR usuário (Admin ou Manager)
router.post(
  "/",
  auth,
  requireRole("Admin", "Manager"),
  async (req, res, next) => {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password)
        return res
          .status(400)
          .json({ error: "Email e password são obrigatórios" });

      const exists = await req.UserModel.findOne({ email });
      if (exists) return res.status(409).json({ error: "Email já cadastrado" });

      const hash = await bcrypt.hash(password, 10);
      const user = await req.UserModel.create({
        email,
        password: hash,
        name,
        role,
      });

      res.status(201).json({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (e) {
      next(e);
    }
  }
);

// /me usando controller (já exige header Authorization)
router.get("/me", auth, me);

module.exports = router;
