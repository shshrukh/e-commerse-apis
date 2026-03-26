import { check, success } from "zod";
import AsyncHandler from "../handlers/AsyncHandler.js";
import CustomError from "../handlers/CustomError.js";
import Category from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";
import { Deal } from "../models/deals.model.js";



// @ create Product controller



const createProduct = AsyncHandler(async (req, res, next) => {
    const { name, price, stock, category, isActive, deals } = req.body;
    const user = req.user;
    if (deals) {
        const product = await Product.create({ name, price, stock, user: user.id, category, isActive });
    }
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
const getAllAdminProducts = AsyncHandler(async (req, res) => {
    const user = req.user;

    const products = await Product.find({ user: user._id })
        .select("name price stock isActive activeDeal") // include only these
        .populate({
            path: "activeDeal",
            select: "discount startDate endDate user"
        });

    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        products
    });
});

//@ create deals

const createDeal = AsyncHandler(async (req, res, next) => {
    const { discount, startDate, endDate } = req.body;
    const user = req.user;
    const productId = req.params.id;

    // console.log(productId,"this is product mongodb id");    // cheking the product ID;

    const product = await Product.findById(productId);
    if (!product) {
        return next(new CustomError(404, "product not found"));
    }
    const existingDeal = await Deal.findOne({ product: productId });
    if (existingDeal) {
        return res.status(400).json({
            success: false,
            message: "deal is allready created. Deal for this product already exists. You can edit it instead."
        })
    }

    const deal = await Deal.create({ discount, startDate, endDate, user: user._id, product: productId });
    if (!deal) {
        return next(new CustomError(404, "deal is not created"));
    }
    await Product.findByIdAndUpdate(productId, { activeDeal: deal._id });

    res.status(200).json({
        success: true,
        message: " deal is created successfuly",
        deal
    })

});

// edit paroduct Deals controller
const editDeals = AsyncHandler(async (req, res, next) => {

    const productId = req.params.id;
    const { discount, startDate, endDate } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
        return next(new CustomError(404, 'product not exists'));
    }
    const deal = await Deal.findOneAndUpdate(
        { product: productId },               // filter → find the deal by product
        { discount, startDate, endDate },     // update → fields to update
        {
            returnDocument: "after",  // instead of `new: true`
            runValidators: true       // ensure schema validation
        }
    );
    if (!deal) {
        return next(new CustomError(404, "Deal not found for this product. Create it first."));
    }

    return res.status(200).json({
        success: true,
        message: " deal is created successfuly",
    })
});


//@ edit product 

const editProduct = AsyncHandler(async (req, res, next) => {
    const productId = req.params.id;
    const { name, price, stoke, isActive, category } = req.body;
    const product = await Product.findByIdAndUpdate(productId, { name, price, stoke, isActive, category }, { returnDocument: "after", runValidators: true });

    if (!product) {
        return next(new CustomError(404, "Failed to update the product"))
    }
    res.status(200).json({
        success: true,
        message: 'product is updated successfully.'
    })
});

// @ delete product
const deleteProduct = AsyncHandler(async (req, res, next) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
        return next(new CustomError(404, "can't find the product"));
    }
    if (product.activeDeal) {
        await Deal.findByIdAndDelete(product.activeDeal)
    }
    await Product.findByIdAndDelete(productId);


    res.status(204).json({
        success: true,
        message: "product is deleted sucessfuly"
    })

});

//@ eidt category 

const editCategory = AsyncHandler(async (req, res, next) => {
    const { name, slug, parentCategoryId } = req.body;
    const id = req.params.id;
    const userId = req.user._id;

    const category = await Category.findById(id);
    if (!category) {
        return next(new CustomError(404, "Category not found"));
    }

    const updateData = {};

    updateData.name = name;
    updateData.slug = slug;

    if (parentCategoryId !== undefined) {

        if (parentCategoryId === id) {
            return next(new CustomError(400, "Category cannot be its own parent"));
        }
        if (parentCategoryId !== null) {
            const parentExists = await Category.findById(parentCategoryId);
            if (!parentExists) {
                return next(new CustomError(404, "Parent category not found"));
            }
        }

        updateData.parentCategoryId = parentCategoryId;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
    );

    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory
    });
});



export { createProduct, createCategory, getAllAdminProducts, createDeal, editDeals, editProduct, deleteProduct, editCategory }