import { Router } from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { createCategorySchema } from "../schemas/createCategory.js";
import { allowRoles } from "../middlewares/allowRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCategory, createDeal, getDeal, deleteCategory, deleteDeal, deleteProduct, editCategory, editDeals, editProduct, getAllAdminProducts, getProduct, getCategory } from "../controllers/porduct.controller.js";
import { productDealSchema } from "../schemas/editPorductDeal.js";
import { productSchema } from "../schemas/product.js";



const adminRoute = Router();
//products
adminRoute.route('/products').get(authMiddleware, allowRoles('admin'), getAllAdminProducts);
adminRoute.route('/products/:id').get( authMiddleware, allowRoles("admin"), getProduct);
adminRoute.route('/products/:id').patch(validateZodSchema(productSchema),authMiddleware, allowRoles('admin'), editProduct);
adminRoute.route('/products/:id').delete(authMiddleware, allowRoles('admin'),deleteProduct);

//category
adminRoute.route("/categories").post(validateZodSchema(createCategorySchema), authMiddleware,  allowRoles("admin"), createCategory);
adminRoute.route('/categories/:id').patch(validateZodSchema(createCategorySchema), authMiddleware, allowRoles("admin"), editCategory);
adminRoute.route('/categories/:id').delete(authMiddleware, allowRoles("admin"), deleteCategory);
adminRoute.route('/categories/:id').get(authMiddleware, allowRoles("admin"), getCategory);

//Deals
adminRoute.route('/products/:productId/deals').post(validateZodSchema(productDealSchema),authMiddleware, allowRoles('admin'), createDeal);
adminRoute.route('/products/:productId/deals/:id').patch(validateZodSchema(productDealSchema), authMiddleware,allowRoles('admin'), editDeals ); 
adminRoute.route('/products/:productId/deals/:id').delete(authMiddleware, allowRoles("admin"), deleteDeal);
adminRoute.route('/products/:productId/deals/:id').get(authMiddleware, allowRoles("admin"), getDeal);



export {adminRoute}