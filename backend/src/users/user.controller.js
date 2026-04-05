const User = require("./user.model");

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error getting details" });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    delete req.body.isBlocked; // Security: Prevent users from unblocking themselves

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating details" });
  }
};
