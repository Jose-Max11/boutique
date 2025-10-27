import Designer from "../models/Designer.js";

// Get all designers
export const getDesigners = async (req, res) => {
  try {
    const designers = await Designer.find();
    res.json(designers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add designer
export const addDesigner = async (req, res) => {
  try {
    const {
      designerId,
      name,
      email,
      phone,
      speciality,
      experience,
      bio,
      skills,
      services,
      certifications,
      languages,
      hourly_rate,
      address,
      city,
      state,
      pincode,
      country,
      social_links,
      portfolioImages,
      designsCreated,
      completedOrders,
      pendingOrders,
      averageRating,
      reviews,
      paymentMode,
      bankName,
      acc_no,
      ifscCode,
      upi_id,
      status,
      availability,
      joinedDate,
      notes,
      remarks
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    const designer = new Designer({
      designerId,
      name,
      email,
      phone,
      speciality,
      experience,
      bio,
      skills,
      services,
      certifications,
      languages,
      hourly_rate,
      address,
      city,
      state,
      pincode,
      country,
      social_links,
      portfolioImages,
      designsCreated,
      completedOrders,
      pendingOrders,
      averageRating,
      reviews,
      paymentMode,
      bankName,
      acc_no,
      ifscCode,
      upi_id,
      status: status || "active",
      availability,
      joinedDate,
      notes,
      remarks,
      profile_image: req.file ? req.file.path : null,
    });

    await designer.save();
    res.status(201).json(designer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update designer
export const updateDesigner = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) updateData.profile_image = req.file.path;

    const designer = await Designer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!designer) return res.status(404).json({ message: "Designer not found" });

    res.json(designer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete designer
export const deleteDesigner = async (req, res) => {
  try {
    const designer = await Designer.findByIdAndDelete(req.params.id);
    if (!designer) return res.status(404).json({ message: "Designer not found" });
    res.json({ message: "Designer deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
