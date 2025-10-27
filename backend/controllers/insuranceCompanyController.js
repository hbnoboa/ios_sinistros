const { geocodeAddress } = require("../utils/geocode");

exports.getInsuranceCompanies = async (req, res) => {
  const Model = req.InsuranceCompanyModel;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const filterText = (req.query.filter || "").trim();
  const filter = filterText
    ? {
        $or: [
          { company_name: { $regex: filterText, $options: "i" } },
          { cnpj: { $regex: filterText, $options: "i" } },
          { email: { $regex: filterText, $options: "i" } },
          { city: { $regex: filterText, $options: "i" } },
          { state: { $regex: filterText, $options: "i" } },
        ],
      }
    : {};

  try {
    const [insuranceCompanies, total] = await Promise.all([
      Model.find(filter).sort({ company_name: 1 }).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);
    res.json({
      insuranceCompanies,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInsuranceCompany = async (req, res) => {
  try {
    const insuranceCompany = await req.InsuranceCompanyModel.findById(
      req.params.id
    );
    if (!insuranceCompany)
      return res.status(404).json({ error: "Não encontrado" });
    res.json(insuranceCompany);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.postInsuranceCompany = async (req, res) => {
  try {
    const Model = req.InsuranceCompanyModel;
    const body = { ...req.body };

    const fullAddress = [body.address, body.city, body.state]
      .filter(Boolean)
      .join(", ");

    if (fullAddress) {
      const geo = await geocodeAddress(fullAddress);
      if (geo) {
        body.location = { type: "Point", coordinates: [geo.lng, geo.lat] };
      }
    }

    const insuranceCompany = await Model.create(body);
    req.app.get("io")?.emit("insuranceCompanyCreated", insuranceCompany);
    res.status(201).json(insuranceCompany);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.putInsuranceCompany = async (req, res) => {
  try {
    const Model = req.InsuranceCompanyModel;
    const body = { ...req.body };

    if ("address" in body || "city" in body || "state" in body) {
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

    const insuranceCompany = await Model.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    if (!insuranceCompany)
      return res.status(404).json({ error: "Não encontrado" });
    req.app.get("io")?.emit("insuranceCompanyUpdated", insuranceCompany);
    res.json(insuranceCompany);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteInsuranceCompany = async (req, res) => {
  try {
    const insuranceCompany = await req.InsuranceCompanyModel.findByIdAndDelete(
      req.params.id
    );
    if (!insuranceCompany)
      return res.status(404).json({ error: "Não encontrado" });
    req.app.get("io")?.emit("insuranceCompanyDeleted", insuranceCompany);
    res.json({ deleted: true, id: insuranceCompany._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
