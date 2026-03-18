const validateZodSchema = (schema) => {
    return (req, res, next)=>{
        
        if(!req.body  || Object.keys(req.body).length === 0){
            return res.status(400).json({
                success: false,
                message: "Request body is required"
            });
        }
        const result = schema.safeParse(req.body);

        if(result.success){
            req.body = result.data;
            return next();
        }
        const errors = {};
        result.error.issues.forEach((issue)=>{
            const path = issue.path[0];
            errors[path] = issue.message;
        });
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors
        });
        
    }
}

export {validateZodSchema};