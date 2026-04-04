require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/users/user.model"); // Adjust path if needed
const { connectToDB } = require("./config/db"); // Adjust path if needed

const seedAdmin = async () => {
  try {
    await connectToDB();

    // 1. Check if an admin already exists to prevent accidental duplicates
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      console.log("⚠️ An Admin already exists. Seeding aborted.",existingAdmin);
      process.exit(0);
    }

    // 2. Hash the default password
    const hashedPassword = await bcrypt.hash(
      process.env.CLIENT_ADMIN_PASSWORD,
      10,
    );

    // 3. Create the first admin
    const firstAdmin = new User({
      name: "Store Owner",
      email: process.env.CLIENT_ADMIN_EMAIL, 
      password: hashedPassword,
      isAdmin: true,
      isVerified: true, // Bypass OTP
    });

    await firstAdmin.save();

    console.log("✅ First Admin created successfully!");
    console.log("📧 Email: ",process.env.CLIENT_ADMIN_EMAIL);
    console.log("🔑 Password:",process.env.CLIENT_ADMIN_PASSWORD);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
