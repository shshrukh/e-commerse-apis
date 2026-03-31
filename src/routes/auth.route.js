import {Router} from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { userLoginSchema } from "../schemas/userLogin.js";
import { loginUser } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.route('/login').post(validateZodSchema(userLoginSchema), loginUser);

export {authRouter}

//     url hit -->   m1  -->   m2-->  --> controller --> service=---> model/db

//  server gracefullt shutdown 
//   unhadnled promise  exception handle 

// use helmet 
// mongo sanitizer 
// race condition  (find it) means do it all or do nothing
// dual write issues  -> outbox pattern
// rabbit mq
//redis
