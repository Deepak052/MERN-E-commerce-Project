const Admin = require("./admin.model");
const User = require("../users/user.model"); // Needs access to User to fetch customers
const bcrypt = require("bcryptjs");
const { sendMail } = require("../../utils/Emails");

// Get all non-admin users (Customers)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers" });
  }
};

// Get all Store Admins (For Super Admin view)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: "Admin" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins" });
  }
};

// Create a new Store Admin
exports.createStoreAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check ONLY the Admin collection
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: "Admin",
    });

    await newAdmin.save();

    const subject = "You are now a Store Administrator";
    const body = `<p>Hello ${name},</p><p>You have been added as a Store Administrator.</p>`;
    await sendMail(email, subject, body);

    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json(adminResponse);
  } catch (error) {
    res.status(500).json({ message: "Error creating store admin" });
  }
};
