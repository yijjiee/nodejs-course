const User = require("../models/userModel");
const handleAsyncFn = require("../utils/handleAsync");
const AppError = require("../utils/appError");

exports.signup = handleAsyncFn(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});
