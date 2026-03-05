import {Router} from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { productSchema } from "../schemas/product.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createProduct} from "../controllers/porduct.controller.js";
import { allowRoles } from "../middlewares/allowRole.middleware.js";


const productRoute = Router();

productRoute.route('/post-product').post(validateZodSchema(productSchema), authMiddleware, allowRoles("admin") , createProduct);




export {productRoute}