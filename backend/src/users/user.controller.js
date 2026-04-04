const User = require("./user.model");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../../utils/Emails");

// ==========================================
// 🟢 PUBLIC CONTROLLERS (For Logged-in Users)
// ==========================================

// Get a user's own profile (or admin fetching a specific user)
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password"); // Strips password securely

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res
      .status(500)
      .json({ message: "Error getting details, please try again later" });
  }
};

// Update a user's profile (Used by user to edit profile, OR by Admin to block user)
exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent standard users from hacking their role via API payload
    if (req.user && !req.user.isAdmin && !req.user.isSuperAdmin) {
      delete req.body.isAdmin;
      delete req.body.isSuperAdmin;
      delete req.body.isBlocked;
    }

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update User Error:", error);
    res
      .status(500)
      .json({ message: "Error updating details, please try again later" });
  }
};

// ==========================================
// 🔴 ADMIN CONTROLLERS (Requires Admin Privileges)
// ==========================================

// Get all non-admin users (Customers)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Get All Customers Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching customers", error: error.message });
  }
};

// Get all Store Admins (For Super Admin view)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true, isSuperAdmin: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(admins);
  } catch (error) {
    console.error("Get All Admins Error:", error);
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// Create a new Store Admin (Bypasses OTP)
exports.createStoreAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
      isVerified: true,
    });

    await newAdmin.save();

    const subject = "You are now a Store Administrator";
    const body = `<p>Hello ${name},</p>
      <p>You have been added as a Store Administrator.</p>
      <p>You can now log in using this email and the password provided by your Super Admin.</p>
      <p>Please log in and update your password immediately.</p>`;

    await sendMail(email, subject, body);

    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json(adminResponse);
  } catch (error) {
    console.error("Create Admin Error:", error);
    res
      .status(500)
      .json({ message: "Error creating store admin", error: error.message });
  }
};
