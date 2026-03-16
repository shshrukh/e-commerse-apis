import AsyncHandler from "../handlers/AsyncHandler.js";
import User from "../models/user.models.js";
import CustomError from "../handlers/CustomError.js";
import crypto from "crypto"
import { eventBus } from "../events/event.bus.js";
import { UserEvents } from "../events/event.constants.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { file, success } from "zod";





//@controller for user registration
const registerUser = AsyncHandler(async(req, res, next)=>{

    const {name, email, password, contactNumber, addresses} = req.body;
    
    const existingUser = await User.findOne({email});
    if(existingUser){
        return next(new CustomError(409, "user with this email already exists"));
    }
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationTokenExpiry = Date.now() + 15* 60 * 1000; // 15 mints


    const user = await User.create({
        name, email, password, contactNumber, addresses, verificationToken, verificationTokenExpiry, 
    });


    
    res.status(201).json({
        success: true,
        message: `User registered successfully. Please check your email ${email} to verify your account.`,
        date: {
            name: user.name,
            verifacationToken: user.verificationToken,
        }
    });

    eventBus.emit(UserEvents.REGISTER, user);

});



//@controller for email verification
const verifyEmail = AsyncHandler(async(req, res, next)=>{
    const {token} = req.params;
    
    const user = await User.findOne({verificationToken: token});
    if(!user){
        return next(new CustomError(400, "Invalid token"));
    }

    //checkint the token expiry time;
    if(user.verificationTokenExpiry < Date.now()){
        return next(new CustomError(400, "Token has expired"));
    };
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save({validateBeforeSave: false});

    return res.status(200).json({
        success: true,
        message: "Email verified successfully"
    })

});

//@ add profile controller

const addProfile = AsyncHandler(async(req, res, next)=>{
    console.log("wworking");
    
    const file = req.file;
    const user = req.user;
    const result = await uploadToCloudinary({resource_type: "image", buffer: file.buffer, folder: "E-commerse_profiles"});
    if(!result){
        return next( new CustomError(500, "faild to upload on cloudinary"));
    };
    console.log(result, "this is result form cloudinary");
    
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            avatar:{
                url: result.secure_url,
                public_id: result.public_id,
            }
        },
        { new: true }
    );
    if(!updatedUser){
        return next(new CustomError(404, "Failed to add profile picture please try agin letter"))
    }

    res.status(200).json({
        success: true,
        user: updatedUser
    })
});
export { registerUser, verifyEmail, addProfile};