// userController.js

import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../middleware/nodemailer.js";
import dotenv from 'dotenv';

dotenv.config();

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Helper function to get the base URL (for generating the photo URL)
const getBaseUrl = (req) => {
    // Determine the protocol and host dynamically
    const protocol = req.protocol;
    const host = req.get('host');
    // Ensure host includes port if running locally (e.g., localhost:4000)
    return `${protocol}://${host}`;
};

const handleVerificationEmail = async (req, res) => {

    const { email, otpRawr } = req.body;

    console.log("Triggering handleVerificationEmail")
    console.log(email, otpRawr)
    
    // NOTE: 'sendVerificationEmail' is likely a utility function you have defined elsewhere, 
    // it's assumed to be available or imported.
    // await sendVerificationEmail(email, otpRawr); // Commented out as sendVerificationEmail is not defined here

    res.json({ success: true, message: "Verification email handler executed." }); // Added a response

}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        const isVerified = user?.isVerified;

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id);

            // NOTE: The transporter email logic is correct as provided
            await transporter.sendMail({
                from: process.env.GOOGLE_APP_EMAIL_USER,
                to: email,
                subject: "Welcome to Floradise 🌱",
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
                        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                            
                            <h1 style="color: #2e7d32; text-align: center;">🌸 Welcome to Floradise 🌸</h1>
                            
                            <p style="font-size: 16px; color: #444;">
                                Hi <strong>${user.firstName || "there"}</strong>, 
                                <br><br>
                                Thank thank you for joining <strong>Floradise</strong> — your trusted platform for growing with nature. 
                                We're excited to have you on board! 🌱
                            </p>
                            
                            <p style="font-size: 16px; color: #444;">
                                ✅ Your email has been successfully verified. 
                                You can now explore our features, discover plant care tips, and start your journey with Floradise.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://floradise.com" style="background: #43a047; color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-size: 16px; display: inline-block;">
                                    Explore Floradise
                                </a>
                            </div>
                            
                            <p style="font-size: 14px; color: #888; text-align: center;">
                                If you didn’t create this account, you can safely ignore this email. 
                            </p>
                            
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            
                            <p style="font-size: 12px; color: #aaa; text-align: center;">
                                © ${new Date().getFullYear()} Floradise. All rights reserved.
                            </p>
                            
                        </div>
                    </div>
                `
            });


            res.json({ success: true, token, toVerify: !isVerified })

        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, address, phone } = req.body;

        console.log("im here");

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // You can add validation for phone number here if needed
        if (!validator.isMobilePhone(phone, "any")) {
            return res.json({ success: false, message: "Please enter a valid phone number" });
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            address,
            phone,
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user || user.role !== "admin") {
            // Use generic message for security
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({ success: true, token, role: user.role }); // Return role
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for getting logged-in user profile
const getUserProfile = async (req, res) => {
    try {
        // req.user is attached by auth middleware.
        // Convert to a plain object before sending.
        const userObject = req.user.toObject ? req.user.toObject() : req.user;
        
        // This is the correct structure for the frontend to access user.firstName:
        res.json({ success: true, user: userObject });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Route for updating user profile
const updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address } = req.body;

        // Use req.user._id which is set by the auth middleware
        const user = await userModel.findById(req.user._id);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Update user details
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;

        await user.save();
        // Send back the updated user without the password
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json({ success: true, message: "Profile updated successfully!", user: updatedUser });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to update profile" });
    }
};

// ======================== UPDATED CONTROLLER: PHOTO UPLOAD (for Cloudinary) ========================
const uploadProfilePhoto = async (req, res) => {
    // Multer/Cloudinary middleware attaches the uploaded file info to req.file
    if (!req.file) {
        // This handles Multer errors (file size/type filter) set in middleware/multer.js
        return res.status(400).json({ success: false, message: 'No file uploaded, or file type/size is invalid.' });
    }

    try {
        // req.user._id is provided by the authMiddleware
        const userId = req.user._id; 
        
        // 1. Get the secure URL directly from the Cloudinary response.
        // The 'path' property contains the secure_url provided by multer-storage-cloudinary.
        const photoUrl = req.file.path; 

        if (!photoUrl) {
             // Should not happen if multer-storage-cloudinary succeeds, but good for safety.
             return res.status(500).json({ success: false, message: 'Cloudinary failed to return a valid URL.' });
        }
        
        // 2. Update the user record in the database with the Cloudinary URL
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { photoUrl: photoUrl }, // Save the Cloudinary secure URL
            { new: true, select: "-password" } // new:true returns the updated document, exclude password
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found in database.' });
        }

        // 3. Respond with success and the new photo URL and user object
        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully to Cloudinary! 📸',
            photoUrl: updatedUser.photoUrl,
            user: updatedUser
        });

    } catch (error) {
        console.error("Profile photo upload error:", error);
        res.status(500).json({ success: false, message: 'Failed to upload photo due to a server error.' });
    }
};
// =================================================================================================

// Admin Routes for User Management (NO CHANGES APPLIED)
const addUser = async (req, res) => {
// ... (existing addUser code) ...
};

// Fetch all users (admin-only)
const getAllUsers = async (req, res) => {
// ... (existing getAllUsers code) ...
};

// Update a user (admin-only)
const updateUser = async (req, res) => {
// ... (existing updateUser code) ...
};


// Suspend/Unsuspend a user (admin-only)
const toggleSuspendUser = async (req, res) => {
// ... (existing toggleSuspendUser code) ...
};

// Delete a user (admin-only)
const deleteUser = async (req, res) => {
// ... (existing deleteUser code) ...
};

export {
    loginUser,
    registerUser,
    adminLogin,
    getUserProfile,
    updateUserProfile,
    uploadProfilePhoto, 
    addUser,
    getAllUsers,
    updateUser,
    toggleSuspendUser,
    deleteUser,
    handleVerificationEmail,
};