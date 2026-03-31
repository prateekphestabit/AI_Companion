const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require('../utils/logger.js');

async function signin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Password" });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
    );

    res.cookie('token', token, {
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      message: "Logged in successfully"
    });
  } catch (error) {
    logger.error("Error in login", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { _id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
    );

    res.cookie('token', token, {
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      message: "Signed Up Successfully"
    });
  } catch (error) {
    logger.error("Error in signup", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function signout(req, res) {
  try {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    logger.error("Error in signout", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

async function checkAuth(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "No JWT token found" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error("Error in auth", error);
      res.clearCookie('token');
      return res.status(401).json({ success: false, message: "Invalid JWT token" });
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
      res.clearCookie('token');
      return res.status(401).json({ success: false, message: "No user found Invalid JWT Token" });
    }

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      message: "Authenticated successfully"
    });

  } catch (error) {
    logger.error("Error in auth", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = {
  signin,
  signup,
  signout,
  checkAuth
};
