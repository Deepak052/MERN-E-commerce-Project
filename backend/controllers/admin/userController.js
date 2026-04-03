const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { sendMail } = require("../../utils/Emails");

// Get all non-admin users (Customers)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
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
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

// Create a new Store Admin
exports.createStoreAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin (Auto-verified, no OTP needed)
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: true,
      isVerified: true, 
    });

    await newAdmin.save();

    // Send a welcome email
    const subject = "You are now a Store Administrator";
    const body = `<p>Hello ${name},</p>
      <p>You have been added as a Store Administrator.</p>
      <p>You can now log in using this email and the password provided by your Super Admin.</p>
      <p>Please log in and update your password immediately.</p>`;
    
    await sendMail(email, subject, body);

    // 🚨 THE FIX: Strip the password before sending the response to the frontend
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json(adminResponse);
    
  } catch (error) {
    res.status(500).json({ message: "Error creating store admin", error: error.message });
  }
};

// Update user (e.g., blocking them)
exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};
