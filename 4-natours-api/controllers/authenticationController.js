const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");
const handleAsyncFn = require("../utils/handleAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  // To remove password from output (Prevention of password showing to user(s))
  user.password = undefined;

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_PRIVATEKEY, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

exports.signup = handleAsyncFn(async (req, res, next) => {
  console.group(req.body);

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  sendToken(newUser, 201, res);
});

exports.login = handleAsyncFn(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password)
    return next(new AppError("Please enter email and password!", 400));

  // Check if user exist && password is correct
  const user = await User.findOne({ email }).select("password");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 401));

  // If everything is okay, send the jwt to client
  sendToken(user, 200, res);
});

// Middleware
exports.protect = handleAsyncFn(async (req, res, next) => {
  // Check if jwt exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "401 Unathorised Access: Please login before trying to access!",
        401
      )
    );
  }

  // Verify jwt
  const decoded = await jwt.verify(token, process.env.JWT_PRIVATEKEY);

  // Check if user still exist
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new AppError(
        "401 Unathorised Access: The request token is invalid as the user does not exist!",
        401
      )
    );

  // Check if user has changed password after token was issued
  const isPwChanged = await user.checkPasswordChanged(decoded.iat);

  if (isPwChanged)
    return next(
      new AppError("401 Unathorised Access: The request token is invalid!"),
      401
    );

  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ["admin", "lead-guide"]. role="user"
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          "403 Forbidden: You do not have the permission to perform this action!",
          403
        )
      );

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // Search if email address exist
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(
      new AppError("Email address is invalid, please try again!", 404)
    );

  // Generate reset token if email exist
  const resetToken = user.createPwResetToken();
  await user.save({ validateBeforeSave: false });

  // Send to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't request for this, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject:
        "Your password reset token (The link is only valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Reset password link have been sent to email!",
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "An error occured while sending the reset password email. Please try again later!",
        500
      )
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError("This link is invalid or has expired.", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  sendToken(user, 200, res);
};

exports.updatePassword = handleAsyncFn(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.currentPassword, user.password)))
    return next(
      new AppError(
        "The current password entered is incorrect! Please try again.",
        401
      )
    );

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  sendToken(user, 200, res);
});
