import { Router } from "express";
import { validateZodSchema } from "../middlewares/validateZodSchema.middleware.js";
import { createCategorySchema } from "../schemas/createCategory.js";
import { allowRoles } from "../middlewares/allowRole.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createProduct, deleteProduct, editProduct, getAdminStats, getAllAdminProducts, getProduct } from "../controllers/product.controller.js";
import { getCategory, deleteCategory, createCategory, editCategory, getAllCategories } from "../controllers/category.controller.js"
import { createDeal, deleteDeal, getDeal, editDeals, getCurrentProductDeal } from "../controllers/deal.controller.js"
import { productDealSchema } from "../schemas/editPorductDeal.js";
import { productSchema } from "../schemas/product.js";
import { imageMulter } from "../middlewares/multerImage.middleware.js";
import { parsedData } from "../middlewares/dataParse.js";



import { updateProductSchema } from "../schemas/updateProduct.js";

const adminRoute = Router();

const uploadImages = imageMulter(5, ["image/png", "image/jpeg", "image/gif", "image/jpg"]);

adminRoute.use(authMiddleware, allowRoles("admin"));
//products

adminRoute.route('/products')
    .get(getAllAdminProducts)
    .post(uploadImages.array("images", 3), parsedData, validateZodSchema(productSchema), createProduct);


adminRoute.route('/products/:productId')
    .get(getProduct)
    .patch(uploadImages.array("images", 3), parsedData, validateZodSchema(updateProductSchema), editProduct)
    .delete(deleteProduct);

//category
adminRoute.route("/categories")
    .get(getAllCategories)
    .post(validateZodSchema(createCategorySchema), createCategory);

adminRoute.route('/categories/:categoryId')
    .patch(validateZodSchema(createCategorySchema), editCategory)
    .delete(deleteCategory)
    .get(getCategory);

//Deals
adminRoute.route('/deals').get(getDeal);
adminRoute.route('/products/:productId/deals').post(validateZodSchema(productDealSchema), createDeal);
adminRoute.route('/products/:productId/deals/current').get(getCurrentProductDeal);

adminRoute.route('/products/:productId/deals/:dealId')
    .patch(validateZodSchema(productDealSchema), editDeals)
    .delete(deleteDeal)
// get the admin products status
adminRoute.route("/status").get(getAdminStats)

export { adminRoute }