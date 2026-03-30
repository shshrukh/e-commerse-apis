import AsyncHandler from "../handlers/AsyncHandler.js";
import CustomError from "../handlers/CustomError.js";
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


//@ edit product 

const editProduct = AsyncHandler(async (req, res, next) => {
    const productId = req.params.productId;
    const { name, price, stoke, isActive, category } = req.body;

    if(!mongoose.Types.ObjectId.isValid(productId)){
        return next(new CustomError(400, "Invalid product ID"))
    }

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
    const productId = req.params.productId;
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

// @ get the product

const getProduct = AsyncHandler(async (req, res, next) => {
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new CustomError(400, "Invalid product ID"))
    }


    const product = await Product.findById(id)
        .select("_id name price stock isActive activeDeal");

    if (!product) {
        return next(new CustomError(404, "Product not found"));
    }
    res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        product
    });

});



export { createProduct, getAllAdminProducts, editProduct, deleteProduct, getProduct }