import CustomError from "../handlers/CustomError.js";


function allowRoles (...roles){
    return (req, res, next)=>{
        const role = req.role;
        if(!roles.includes(role)){
            return next( new CustomError(403, "Forbiden only admin can access the role"));
        }
        return next()
    }
}

export {allowRoles}