import { success } from "zod";
import AsyncHandler from "../handlers/AsyncHandler.js";
import CustomError from "../handlers/CustomError.js";
import Category from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";



// @ create Product controller



const createProduct = AsyncHandler(async (req, res, next) => {
    const { name, price, stock, category, isActive } = req.body;
    const user = req.user;

    const product = await Product.create({ name, price, stock, user: user.id, category, isActive });
    if (!product) {
        return next(new CustomError(500, "failed to create product"))
    };

    res.status(201).json({
        success: true,
        message: "product is created successfuly",
        product
    })
});

// @ verify product Category

const createCategory = AsyncHandler(async (req, res, next) => {
    const { name, slug, parentCategoryId } = req.body;
    const user = req.user;
    if (parentCategoryId) {

        if (!mongoose.Types.ObjectId.isValid(parentCategoryId)) {
            return next(new CustomError(400, "Invalid parent category id"));
        }

        const existingParentCategory = await Category.findById(parentCategoryId);


        if (!existingParentCategory) {
            return next(new CustomError(400, "Parent category is not avaliable"));
        }
    }

    const createCategory = await Category.create({ name, slug, createdBy: user._id, parentCategoryId: parentCategoryId || null });

    if (!createCategory) {
        return next(new CustomError(500, "Failed to create the category"));
    }
    res.status(201).json({
        success: true,
        message: "Category is created successfully",
        categoryId: createCategory._id
    })
});


//@ get all admin products
const getAllAdminProducts = AsyncHandler(async(req, res, next)=>{
    const user = req.user;
    const products = await Product.find({ user: user._id })
        .select("-user -__v -_id -category -createdAt -updatedAt");
        
    res.status(200).json({
        success: true,
        message: 'procucts are fetch successfully',
        products
    })
});


//@ edit product deals

const editProductDeals = AsyncHandler(async(req, res, next)=>{
    const { discount, startDate, endDate} = req.body;
    const user = req.user;
    const productId = req.query.id;


    // find the product using the id in req.qurry

    const product = await Product.findById(productId);
    if(!product){
        return next( CustomError(404, 'product not found'));
    }

    await product.save()
    
    res.status(200).json({
        success: true,
        message: 'deal is created successfully'
    })
    
});



export { createProduct, createCategory, getAllAdminProducts, editProductDeals }