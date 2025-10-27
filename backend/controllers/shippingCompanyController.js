// Usa req.ShippingCompanyModel injetado pela rota
exports.getShippingCompanies = async (req, res) => {
  const Model = req.ShippingCompanyModel;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const filter = req.query.filter
    ? { company_name: { $regex: req.query.filter, $options: "i" } }
    : {};

  try {
    const [items, total] = await Promise.all([
      Model.find(filter).sort({ company_name: 1 }).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);
    res.json({
      shippingCompanies: items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getShippingCompany = async (req, res) => {
  try {
    const item = await req.ShippingCompanyModel.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Não encontrada" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.postShippingCompany = async (req, res) => {
  try {
    const item = await req.ShippingCompanyModel.create(req.body);
    req.app.get("io")?.emit("shippingCompanyCreated", item);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.putShippingCompany = async (req, res) => {
  try {
    const item = await req.ShippingCompanyModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Não encontrada" });
    req.app.get("io")?.emit("shippingCompanyUpdated", item);
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteShippingCompany = async (req, res) => {
  try {
    const item = await req.ShippingCompanyModel.findByIdAndDelete(
      req.params.id
    );
    if (!item) return res.status(404).json({ error: "Não encontrada" });
    req.app.get("io")?.emit("shippingCompanyDeleted", item);
    res.json({ deleted: true, id: item._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
