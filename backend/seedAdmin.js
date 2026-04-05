require("dotenv").config();
const bcrypt = require("bcryptjs");
const Admin = require("./src/admins/admin.model");
const { connectToDB } = require("./config/db");

const seedAdmin = async () => {
  try {
    await connectToDB();

    // 🚨 FIX: Check for standard "Admin"
    const existingAdmin = await Admin.findOne({ role: "Admin" });

    if (existingAdmin) {
      console.log(
        "⚠️ An Admin already exists in the Admin collection. Seeding aborted.",
      );
      process.exit(0);
    }

    const password = process.env.CLIENT_ADMIN_PASSWORD || "Admin@123";
    const email = process.env.CLIENT_ADMIN_EMAIL || "admin@shopsphere.com";
    const hashedPassword = await bcrypt.hash(password, 10);

    const firstAdmin = new Admin({
      name: "Store Owner",
      email: email,
      password: hashedPassword,
      role: "Admin", // 🚨 FIX: Set to standard Admin
      isBlocked: false,
    });

    await firstAdmin.save();
    console.log("✅ Store Owner Admin created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
