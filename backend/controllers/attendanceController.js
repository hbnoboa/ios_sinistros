exports.getAttendances = async (req, res) => {
  const Model = req.AttendanceModel;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  try {
    const [attendances, total] = await Promise.all([
      Model.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Model.countDocuments(),
    ]);
    res.json({
      attendances,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const attendance = await req.AttendanceModel.findById(req.params.id);
    if (!attendance)
      return res.status(404).json({ error: "Atendimento não encontrado" });
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.postAttendance = async (req, res) => {
  try {
    const attendance = await req.AttendanceModel.create(req.body);
    req.app.get("io")?.emit("attendanceCreated", attendance);
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.putAttendance = async (req, res) => {
  try {
    const attendance = await req.AttendanceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!attendance)
      return res.status(404).json({ error: "Atendimento não encontrado" });
    req.app.get("io")?.emit("attendanceUpdated", attendance);
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await req.AttendanceModel.findByIdAndDelete(
      req.params.id
    );
    if (!attendance)
      return res.status(404).json({ error: "Atendimento não encontrado" });
    req.app.get("io")?.emit("attendanceDeleted", attendance);
    res.json({ deleted: true, id: attendance._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
