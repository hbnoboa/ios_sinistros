const { geocodeAddress } = require("../utils/geocode");

exports.getBrokers = async (req, res) => {
  const Model = req.BrokerModel;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const filter =
    req.query.filter && req.query.filter.trim()
      ? {
          $or: [
            { email: { $regex: req.query.filter, $options: "i" } },
            { city: { $regex: req.query.filter, $options: "i" } },
            { state: { $regex: req.query.filter, $options: "i" } },
          ],
        }
      : {};

  try {
    const [brokers, total] = await Promise.all([
      Model.find(filter).sort({ email: 1 }).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);
    res.json({
      brokers,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBroker = async (req, res) => {
  try {
    const broker = await req.BrokerModel.findById(req.params.id);
    if (!broker) return res.status(404).json({ error: "Não encontrado" });
    res.json(broker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.postBroker = async (req, res) => {
  try {
    const Model = req.BrokerModel;
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

    const broker = await Model.create(body);
    req.app.get("io")?.emit("brokerCreated", broker);
    res.status(201).json(broker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.putBroker = async (req, res) => {
  try {
    const Model = req.BrokerModel;
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

    const broker = await Model.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });
    if (!broker) return res.status(404).json({ error: "Não encontrado" });
    req.app.get("io")?.emit("brokerUpdated", broker);
    res.json(broker);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBroker = async (req, res) => {
  try {
    const broker = await req.BrokerModel.findByIdAndDelete(req.params.id);
    if (!broker) return res.status(404).json({ error: "Não encontrado" });
    req.app.get("io")?.emit("brokerDeleted", broker);
    res.json({ deleted: true, id: broker._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
