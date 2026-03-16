import multer from "multer";



const imageMulter = function(maxSize, allowType){
    
    const storage = multer.memoryStorage();
    const limits = { maxSize: maxSize * 1024* 1024};
    const fileFilter = function(req, file, cb){
        if(allowType.includes(file.mimetype)){
            return cb(null, true)
        };
        cb(new Error("File type is not allowed"), false)
    };
    return multer({storage, limits, fileFilter})
};

export {imageMulter};