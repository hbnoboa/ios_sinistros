const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    console.warn("auth: Authorization ausente/ inválido:", header);
    return res.status(401).json({ error: "Token não fornecido" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    console.warn("auth: jwt.verify falhou:", e.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
