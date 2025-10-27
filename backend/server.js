const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

require("dotenv").config();

const userRoute = require("./routes/userRoute.js");
const shippingCompanyRoute = require("./routes/shippingCompanyRoute.js");
const insuredRoute = require("./routes/insuredRoute.js");
const attendanceRoute = require("./routes/attendanceRoute.js");
const auditLog = require("./middleware/auditLog.js");
const auditLogRoute = require("./routes/auditLogRoute.js");
const auth = require("./middleware/auth");
const tenantGuard = require("./middleware/tenantGuard");
const brokerRoute = require("./routes/brokerRoute.js");
const insuranceCompanyRoute = require("./routes/insuranceCompanyRoute.js");
const riskManagerRoute = require("./routes/riskManagerRoute.js");
const regulatorsRoute = require("./routes/regulatorRoute.js");
const attendanceFilesRoute = require("./routes/attendanceFilesRoute.js");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 8080;
const ENV = process.env.NODE_ENV || "development";

app.use(cors());
app.use(express.json());
app.set("io", io);

app.use(auditLog);

// ========== ROTAS PÚBLICAS ==========
app.use("/api/users", userRoute);

// ========== SERVIR ARQUIVOS ESTÁTICOS (PRODUÇÃO) - ANTES DO AUTH ==========
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/build")));
}

// ========== MIDDLEWARE DE AUTENTICAÇÃO (APENAS ROTAS /api/*) ==========
app.use("/api", auth, tenantGuard);

// ========== ROTAS PROTEGIDAS ==========
app.use("/api/shipping-companies", shippingCompanyRoute);
app.use("/api/insureds", insuredRoute);
app.use("/api/attendances", attendanceRoute);
app.use("/api/audit-logs", auditLogRoute);
app.use("/api/brokers", brokerRoute);
app.use("/api/insurance-companies", insuranceCompanyRoute);
app.use("/api/risk-managers", riskManagerRoute);
app.use("/api/regulators", regulatorsRoute);
app.use("/api/attendances/:attendanceId/files", attendanceFilesRoute);

// ========== CATCH-ALL PARA SPA (PRODUÇÃO) ==========
if (process.env.NODE_ENV === "production") {
  app.use((req, res) => {
    res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
  });
} else {
  // 404 handler para desenvolvimento
  app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
  });
}

// ========== ERROR HANDLER GLOBAL ==========
app.use((err, req, res, next) => {
  console.error("Erro capturado:", err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

io.on("connection", (socket) => {
  console.log("Novo cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});
