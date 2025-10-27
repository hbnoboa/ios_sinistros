exports.getRiskManagers = async (req, res) => {
  const Model = req.RiskManagerModel;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const f = (req.query.filter || "").trim();
  const filter = f
    ? {
        $or: [
          { name: { $regex: f, $options: "i" } },
          { cnpj: { $regex: f, $options: "i" } },
          { email: { $regex: f, $options: "i" } },
          { phone: { $regex: f, $options: "i" } },
        ],
      }
    : {};

  try {
    const [riskManagers, total] = await Promise.all([
      Model.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);
    res.json({ riskManagers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRiskManager = async (req, res) => {
  try {
    const item = await req.RiskManagerModel.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Não encontrado" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.postRiskManager = async (req, res) => {
  try {
    const item = await req.RiskManagerModel.create(req.body);
    req.app.get("io")?.emit("riskManagerCreated", item);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.putRiskManager = async (req, res) => {
  try {
    const item = await req.RiskManagerModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Não encontrado" });
    req.app.get("io")?.emit("riskManagerUpdated", item);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRiskManager = async (req, res) => {
  try {
    const item = await req.RiskManagerModel.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Não encontrado" });
    req.app.get("io")?.emit("riskManagerDeleted", item);
    res.json({ deleted: true, id: item._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
