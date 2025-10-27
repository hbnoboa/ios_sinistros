const express = require("express");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const auth = require("../middleware/auth");
const tenantGuard = require("../middleware/tenantGuard");
const requireRole = require("../middleware/role");
const { getTenantConnection } = require("../utils/tenantManager");
const getAttendanceModel = require("../models/attendanceModel");

const router = express.Router({ mergeParams: true });
const upload = multer(); // memória

// Helper para obter o Db nativo a partir da conexão do tenant (Mongoose)
const getDbFromConn = (conn) => {
  if (!conn) return null;
  // Preferir o client nativo (funciona mesmo se conn.db ainda não estiver setado)
  if (typeof conn.getClient === "function" && conn.name)
    return conn.getClient().db(conn.name);
  if (conn.client && conn.name) return conn.client.db(conn.name); // fallback versões antigas
  if (conn.db) return conn.db; // mongoose.Connection.db
  if (conn.connection?.db) return conn.connection.db;
  return null;
};

// Espera a conexão do Mongoose ficar pronta
const ensureConnected = async (conn) => {
  if (!conn) return;
  if (conn.readyState === 1) return; // connected
  if (typeof conn.asPromise === "function") {
    await conn.asPromise();
    return;
  }
  await new Promise((resolve, reject) => {
    const onOk = () => {
      cleanup();
      resolve();
    };
    const onErr = (err) => {
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      conn.off?.("connected", onOk);
      conn.off?.("error", onErr);
    };
    conn.once?.("connected", onOk);
    conn.once?.("error", onErr);
  });
};

// Injeta Model e GridFSBucket por tenant e valida o atendimento
router.use(auth, tenantGuard, async (req, res, next) => {
  try {
    const conn = getTenantConnection(req.tenantId);
    if (!conn)
      return res.status(500).json({ error: "Tenant connection not found" });

    // Aguarda a conexão do tenant
    await ensureConnected(conn);

    const db = getDbFromConn(conn);
    if (!db) return res.status(500).json({ error: "Tenant DB not connected" });

    req.AttendanceModel = getAttendanceModel(conn);
    req.gridfs = new GridFSBucket(db, { bucketName: "uploads" });

    const exists = await req.AttendanceModel.exists({
      _id: req.params.attendanceId,
    });
    if (!exists) return res.status(404).json({ error: "Attendance not found" });

    next();
  } catch (e) {
    next(e);
  }
});

// Lista os arquivos do atendimento (direto do documento)
router.get("/", auth, tenantGuard, async (req, res, next) => {
  try {
    const doc = await req.AttendanceModel.findById(req.params.attendanceId)
      .select("files -_id")
      .lean();
    return res.json(doc?.files || []);
  } catch (e) {
    next(e);
  }
});

// Download por filename
router.get("/:filename", async (req, res) => {
  try {
    const stream = req.gridfs.openDownloadStreamByName(req.params.filename);
    stream.on("file", (file) => {
      res.set("Content-Type", file.contentType || "application/octet-stream");
    });
    stream.on("error", () => res.status(404).json({ error: "File not found" }));
    stream.pipe(res);
  } catch {
    res.status(500).json({ error: "Internal error" });
  }
});

// POST / - upload e adiciona no attendance.files
router.post(
  "/",
  requireRole("Admin", "Manager"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "file is required" });

      const category = req.body.category || null;
      const filename = `${Date.now()}-${req.file.originalname}`;
      const uploadStream = req.gridfs.openUploadStream(filename, {
        contentType: req.file.mimetype,
      });

      uploadStream.once("error", next);
      uploadStream.once("finish", async () => {
        // garante alteração no array via doc.save()
        const doc = await req.AttendanceModel.findById(req.params.attendanceId);
        if (!doc)
          return res.status(404).json({ error: "Attendance not found" });

        doc.files.push({
          datetime: new Date(),
          category,
          originalname: req.file.originalname,
          filename,
        });
        await doc.save();

        return res.status(201).json({ filename, id: uploadStream.id });
      });

      uploadStream.end(req.file.buffer);
    } catch (e) {
      next(e);
    }
  }
);

// PUT /:filename - substitui arquivo e atualiza entry existente; se não achar, cria nova
router.put(
  "/:filename",
  requireRole("Admin", "Manager"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "file is required" });

      // remove antigo do GridFS (se existir)
      const old = await req.gridfs
        .find({ filename: req.params.filename })
        .toArray();
      if (old.length) await req.gridfs.delete(old[0]._id);

      const newFilename = `${Date.now()}-${req.file.originalname}`;
      const uploadStream = req.gridfs.openUploadStream(newFilename, {
        contentType: req.file.mimetype,
      });

      uploadStream.once("error", next);
      uploadStream.once("finish", async () => {
        const doc = await req.AttendanceModel.findById(req.params.attendanceId);
        if (!doc)
          return res.status(404).json({ error: "Attendance not found" });

        const category = req.body.category || null;
        const now = new Date();

        // 1) tenta localizar por filename
        let idx = doc.files.findIndex(
          (f) => f.filename === req.params.filename
        );

        // 2) fallback por categoria, se não encontrou e houver categoria
        if (idx < 0 && category) {
          idx = doc.files.findIndex(
            (f) => (f.category || "").toLowerCase() === category.toLowerCase()
          );
        }

        const payload = {
          datetime: now,
          category: category ?? doc.files[idx]?.category ?? null,
          originalname: req.file.originalname,
          filename: newFilename,
        };

        if (idx >= 0) {
          doc.files[idx] = payload;
        } else {
          doc.files.push(payload);
        }

        await doc.save();

        return res.json({
          filename: newFilename,
          id: uploadStream.id,
          updated: idx >= 0,
        });
      });

      uploadStream.end(req.file.buffer);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /:filename - remove do GridFS e do array files
router.delete(
  "/:filename",
  requireRole("Admin", "Manager"),
  async (req, res, next) => {
    try {
      const found = await req.gridfs
        .find({ filename: req.params.filename })
        .toArray();
      if (found.length) await req.gridfs.delete(found[0]._id);

      const doc = await req.AttendanceModel.findById(req.params.attendanceId);
      if (!doc) return res.status(404).json({ error: "Attendance not found" });
      doc.files = (doc.files || []).filter(
        (f) => f.filename !== req.params.filename
      );
      await doc.save();

      return res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
