exports.getRegulators = async (req, res) => {
  const Model = req.RegulatorModel;
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
    const [regulators, total] = await Promise.all([
      Model.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);
    res.json({ regulators, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRegulator = async (req, res) => {
  try {
    const regulator = await req.RegulatorModel.findById(req.params.id);
    if (!regulator)
      return res.status(404).json({ error: "Regulador não encontrado" });
    res.json(regulator);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.postRegulator = async (req, res) => {
  try {
    const regulator = await req.RegulatorModel.create(req.body);
    req.app.get("io")?.emit("regulatorCreated", regulator);
    res.status(201).json(regulator);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.putRegulator = async (req, res) => {
  try {
    const regulator = await req.RegulatorModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!regulator)
      return res.status(404).json({ error: "Regulador não encontrado" });
    req.app.get("io")?.emit("regulatorUpdated", regulator);
    res.json(regulator);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteRegulator = async (req, res) => {
  try {
    const regulator = await req.RegulatorModel.findByIdAndDelete(req.params.id);
    if (!regulator)
      return res.status(404).json({ error: "Regulador não encontrado" });
    req.app.get("io")?.emit("regulatorDeleted", regulator);
    res.json({ deleted: true, id: regulator._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
