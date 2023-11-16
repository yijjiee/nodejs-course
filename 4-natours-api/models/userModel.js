const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please let us know your name."],
  },
  email: {
    type: String,
    required: [true, "Please provide your email."],
    unique: true,
    lowercase: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Please provide a valid email address.",
    ],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Password cannot be empty!"],
    minlength: [8, "Password length cannot be shorter than 8 characters!"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "Confirm password cannot be empty!"],
    validate: {
      // Validator only works on CREATE and SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: "Confirm Password must be same as password!",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});

// Any document middleware
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
});

// Any query middleware

// Any aggregation middleware

const User = mongoose.model("User", userSchema);

module.exports = User;
