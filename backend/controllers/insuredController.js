const { geocodeAddress } = require("../utils/geocode");

exports.getInsureds = async (req, res) => {
  const Model = req.InsuredModel;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const filter = req.query.filter
    ? { fantasy_name: { $regex: req.query.filter, $options: "i" } }
    : {};

  try {
    const [insureds, total] = await Promise.all([
      Model.find(filter).sort({ fantasy_name: 1 }).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);
    res.json({
      insureds,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInsured = async (req, res) => {
  try {
    const insured = await req.InsuredModel.findById(req.params.id);
    if (!insured) return res.status(404).json({ error: "Não encontrado" });
    res.json(insured);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.postInsured = async (req, res) => {
  try {
    const Model = req.InsuredModel;
    const body = { ...req.body };

    // Monta endereço completo (ajuste conforme seu padrão)
    const fullAddress = [body.address, body.city, body.state]
      .filter(Boolean)
      .join(", ");

    if (fullAddress) {
      const geo = await geocodeAddress(fullAddress);
      if (geo) {
        body.location = { type: "Point", coordinates: [geo.lng, geo.lat] };
      }
    }

    const insured = await Model.create(body);
    req.app.get("io")?.emit("insuredCreated", insured);
    res.status(201).json(insured);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.putInsured = async (req, res) => {
  try {
    const Model = req.InsuredModel;
    const body = { ...req.body };

    // Se endereço/cidade/estado foram atualizados, re-geocodifica
    if ("address" in body || "city" in body || "state" in body) {
      // busca documento atual para montar endereço final
      const current = await Model.findById(req.params.id).lean();
      if (!current) return res.status(404).json({ error: "Não encontrado" });

      const address = body.address ?? current.address;
      const city = body.city ?? current.city;
      const state = body.state ?? current.state;

      const fullAddress = [address, city, state].filter(Boolean).join(", ");
      if (fullAddress) {
        const geo = await geocodeAddress(fullAddress);
        body.location = geo
          ? { type: "Point", coordinates: [geo.lng, geo.lat] }
          : undefined;
      }
    }

    const insured = await Model.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    if (!insured) return res.status(404).json({ error: "Não encontrado" });
    req.app.get("io")?.emit("insuredUpdated", insured);
    res.json(insured);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteInsured = async (req, res) => {
  try {
    const insured = await req.InsuredModel.findByIdAndDelete(req.params.id);
    if (!insured) return res.status(404).json({ error: "Não encontrado" });
    req.app.get("io")?.emit("insuredDeleted", insured);
    res.json({ deleted: true, id: insured._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
