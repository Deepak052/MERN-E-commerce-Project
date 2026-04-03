const express = require("express");
const userController = require("../../controllers/admin/userController");
const router = express.Router();

router
  .get("/", userController.getAllUsers)
  .get("/store-admins", userController.getAllAdmins)
  .post("/create-admin", userController.createStoreAdmin)
  .patch("/:id", userController.updateUserById);

module.exports = router;
