const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


// ==============================
// Register
// ==============================

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Remove password before sending
    const userResponse =
      user.toObject();

    delete userResponse.password;

    res.status(201).json({
      message:
        "User registered successfully",
      user: userResponse,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// ==============================
// Login
// ==============================

const login = async (req, res) => {

  try {

    const { email, password } =
      req.body;

    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (!user) {

      return res.status(400).json({
        message:
          "Invalid Credentials",
      });

    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {

      return res.status(400).json({
        message:
          "Invalid Credentials",
      });

    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Remove password before sending

    const userResponse =
      user.toObject();

    delete userResponse.password;

    res.status(200).json({

      token,

      user: userResponse,

    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};
// ==============================
// Forgot Password
// ==============================

const forgotPassword = async (
  req,
  res
) => {
  try {

    const { email } = req.body;

    const user =
      await User.findOne({
        email,
      });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Generate Token
    const resetToken =
      crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken =
      resetToken;

    user.resetPasswordExpire =
      Date.now() +
      15 * 60 * 1000; // 15 minutes

    await user.save();

    // Reset Link
    const resetUrl =
      `http://localhost:5173/reset-password/${resetToken}`;

    const html = `
      <h2>Password Reset</h2>

      <p>Hello ${user.name},</p>

      <p>Click the button below to reset your password.</p>

      <a href="${resetUrl}"
         style="
           background:#2563eb;
           color:white;
           padding:12px 20px;
           text-decoration:none;
           border-radius:6px;
         ">
         Reset Password
      </a>

      <p>This link will expire in 15 minutes.</p>

      <p>If you didn't request this, ignore this email.</p>
    `;

    await sendEmail(
      user.email,
      "Reset Your Password",
      html
    );

    res.status(200).json({
      message:
        "Password reset email sent.",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }

};
// ==============================
// Reset Password
// ==============================

const resetPassword = async (
  req,
  res
) => {

  try {

    const { token } =
      req.params;

    const { password } =
      req.body;

    const user =
      await User.findOne({

        resetPasswordToken:
          token,

        resetPasswordExpire: {
          $gt: Date.now(),
        },

      });

    if (!user) {

      return res.status(400).json({

        message:
          "Invalid or expired reset link.",

      });

    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    user.password =
      hashedPassword;

    user.resetPasswordToken =
      null;

    user.resetPasswordExpire =
      null;

    await user.save();

    res.status(200).json({

      message:
        "Password reset successfully.",

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      message:
        error.message,

    });

  }

};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};