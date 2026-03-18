import { cloudinary } from "../config/cloudniry.config.js";
import streamifier from "streamifier";


const uploadToCloudinary = async({
    resource_type = "image",
    buffer,
    folder,
    transformation = []
})=>{
    return new Promise((resolve, reject)=>{
        const stream = cloudinary.uploader.upload_stream(
            {resource_type, folder, transformation},
            (error, result)=>{
                if(error) return reject(error);
                resolve(result);
            }
        )
        streamifier.createReadStream(buffer).pipe(stream)
    });
}

export {uploadToCloudinary};