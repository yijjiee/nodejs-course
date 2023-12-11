const express = require("express");
const userCon = require("../controllers/userController");
const authCon = require("../controllers/authenticationController");

const router = express.Router();

router.post("/signup", authCon.signup);
router.post("/login", authCon.login);

router.post("/forgotPassword", authCon.forgotPassword);
router.patch("/resetPassword/:token", authCon.resetPassword);

router.patch("/updatePassword", authCon.protect, authCon.updatePassword);
router.patch("/updateProfile", authCon.protect, userCon.updateProfile);
router.delete("/deleteAccount", authCon.protect, userCon.deleteAccount);

router.route("/").get(userCon.getAllUsers).post(userCon.createUser);

router
  .route("/:id")
  .get(userCon.getUser)
  .patch(authCon.protect, authCon.restrictTo("admin"), userCon.updateUser)
  .delete(authCon.protect, authCon.restrictTo("admin"), userCon.deleteUser);

module.exports = router;
