import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js' // Assuming you need to fetch the user

const adminAuth = async (req, res, next) => {
    try {
        // 1. Get the token (assuming it's in the headers)
        const token = req.headers.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized, Token Missing." });
        }

        // 2. Verify the token signature and decode the payload (user ID)
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Fetch the user from the database
        const user = await userModel.findById(token_decode.id); 

        // 4. CRITICAL CHECK: Verify the user role
        if (!user || user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not an admin." });
        }
        
        // 5. Attach the user object to the request and proceed
        req.user = user; 
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: "Authentication failed. Please log in again." });
    }
}

export default adminAuth;