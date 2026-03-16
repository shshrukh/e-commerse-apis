import { cloudinary } from "../config/cloudniry.config.js";
import streamifier from "streamifier";


const uploadToCloudinary = async({resource_type = "image", buffer, folder, transformation})=>{
    return new Promise((res, rej)=>{
        const stream = cloudinary.uploader.upload_stream(
            {folder, resource_type, transformation},
            (error, result)=>{
                if(error) return rej(error);
                res(result);
            }
        )
        streamifier.createReadStream(buffer).pipe(stream);
    });

};


export{ uploadToCloudinary };