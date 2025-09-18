import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Fetch user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password -__v");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update user cart
const updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    await userModel.findByIdAndUpdate(req.userId, { cartData: cartItems });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User doesn't exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// User register
const registerUser = async (req, res) => {
  try {
    const {
      name, firstName, lastName,
      email, password,
      street, city, state, zipcode, country, phone
    } = req.body;

    if (await userModel.findOne({ email })) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 chars" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name: name || `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      firstName, lastName,
      street, city, state, zipcode, country, phone,
      cartData: {} // initialize empty cart
    });

    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin, getUserProfile, updateCart };
