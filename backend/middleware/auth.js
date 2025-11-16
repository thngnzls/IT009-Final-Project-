import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authUser = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    } else {
      return res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIX: Do not exclude the password when fetching the user
    // This allows the Mongoose document to be saved correctly later
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ success: false, message: "Not Authorized, Login Again" });
  }
};

export default authUser;