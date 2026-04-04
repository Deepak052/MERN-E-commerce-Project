const Address = require("./address.model");

exports.create = async (req, res) => {
  try {
    // SECURITY FIX: Force the user ID from the verified token
    const newAddress = new Address({
      ...req.body,
      user: req.user._id,
    });

    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Create Address Error:", error);
    return res
      .status(500)
      .json({ message: "Error adding address, please try again later" });
  }
};

exports.getByUserId = async (req, res) => {
  try {
    // SECURITY FIX: Only fetch addresses for the currently authenticated user
    const results = await Address.find({ user: req.user._id });
    res.status(200).json(results);
  } catch (error) {
    console.error("Get Addresses Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching addresses, please try again later" });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY FIX: Ensure the address actually belongs to the user trying to update it
    const updated = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Address Error:", error);
    res
      .status(500)
      .json({ message: "Error updating address, please try again later" });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY FIX: Ensure the address actually belongs to the user trying to delete it
    const deleted = await Address.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized" });
    }

    res.status(200).json(deleted);
  } catch (error) {
    console.error("Delete Address Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting address, please try again later" });
  }
};
