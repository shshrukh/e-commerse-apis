import jwt from "jsonwebtoken";
import AsyncHandler from "../handlers/AsyncHandler.js";
import CustomError from "../handlers/CustomError.js";
import User from "../models/user.models.js";


const authMiddleware = AsyncHandler(async (req, res, next) => {


    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        return next(new CustomError(401, "Unauthorized, token not found"));
    };
    let decoded;
    try {

        decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    } catch (error) {
        return next(new CustomError(401, "Unauthorized, invalid token"));
    }
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new CustomError(401, "User not found or session invalid"));
    }
    if (!user.isVerified) {
        return next(new CustomError(403, "Account not verified. Please verify your email."))
    }

    req.user = user;
    req.role = user.role;


    next();
});

export { authMiddleware }