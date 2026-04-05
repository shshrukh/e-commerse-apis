import jwt from "jsonwebtoken";
import CustomError from "../handlers/CustomError.js"

const generateAccessToken =  (user)=>{
    if(!user){
        throw new CustomError(404, "user is not defined to generate token")
    }
    const token = jwt.sign({id: user._id}, process.env.JWT_ACCESS_SECRET, {expiresIn: "15d"});
    return token;
}


const generateRefreshToken = (user)=>{
    if(!user){
        throw new CustomError(404, "user is not defined to generate token")
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_REFFESH_SECRET, {expiresIn: "15d"})
    return token;
}

export { generateAccessToken, generateRefreshToken}