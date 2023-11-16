const express = require("express");
const userCon = require("../controllers/userController");
const authCon = require("../controllers/authenticationController");

const router = express.Router();

router.post("/signup", authCon.signup);

router.route("/").get(userCon.getAllUsers).post(userCon.createUser);

router
  .route("/:id")
  .get(userCon.getUser)
  .patch(userCon.updateUser)
  .delete(userCon.deleteUser);

module.exports = router;
