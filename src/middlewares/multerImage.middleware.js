import multer from "multer";



const imageMulter = function(maxSize, allowType){
    
    const storage = multer.memoryStorage();
    const limits = { fileSize: maxSize * 1024* 1024};
    const fileFilter = function(req, file, cb){
        if(!allowType.includes(file.mimetype)){
            return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", " invalid file type"));
        };
        cb(null, true);
    };
    return multer({storage, limits, fileFilter})
};

export {imageMulter};