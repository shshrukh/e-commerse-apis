import AsyncHandler from "../handlers/AsyncHandler.js";
import CustomError  from "../handlers/CustomError.js";
import User from "../models/user.models.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";




const loginUser = AsyncHandler(async(req, res, next)=>{
    
    const {email, password} = req.body;
    
    const user = await User.findOne({email}).select("+password");
    
    
    if(!user){
        return next(new CustomError(404, "user not found with this email"));
    }
    if(!user.isVerified){
        return next(new CustomError(403, "Account not verified. Please verify your email."))
    }
    
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next( new CustomError(401, "invalid credentials"));
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    user.refreshToken.push({token: refreshToken})
    const updatedUser = await user.save();
    if(!updatedUser){
        return next(new CustomError(500, "error while saving refresh token"));
    };

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days
    }).status(200).json({
        success: true,
        message: "User logged in successfully",
        accessToken
    })
    
});


export { loginUser };