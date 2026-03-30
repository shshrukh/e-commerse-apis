import AsyncHandler from "../handlers/AsyncHandler.js";
import CustomError from "../handlers/CustomError.js";
import Category from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";
import { Deal } from "../models/deals.model.js";
import { ja } from "zod/locales";




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
    const productId = req.params.productId;

    // console.log(productId,"this is product mongodb id");    // cheking the product ID;
    if(!mongoose.Types.ObjectId.isValid(productId)){
        return next(new CustomError(400, "Invalid product ID"))
    }

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
        return next(new CustomError(500, "Failed to create the deal. Please try again letter"));
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

    const productId = req.params.productId;
    const dealId = req.params.id;
    const { discount, startDate, endDate } = req.body;

    (!mongoose.Types.ObjectId.isValid(productId)) && next(new CustomError(400, "Invalid product ID"));
    (!mongoose.Types.ObjectId.isValid(dealId)) && next(new CustomError(400, "Invalid deal ID"));

    const product = await Product.findById(productId);
    if (!product) {
        return next(new CustomError(404, 'product not exists'));
    }

    const existingDeal = await Deal.findById(dealId);
    if (!existingDeal) {
        return next(new CustomError(404, "deal not found. Create the deal first."));
    }

    const deal = await Deal.findOneAndUpdate(
        { _id: dealId },               // filter → find the deal by its own ID
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


// @delete Category 

const deleteCategory = AsyncHandler(async (req, res, next) => {
    const categoryId = req.params.id;
    const userId = req.user._id;

    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory || existingCategory.isDeleted) {
        return next(new CustomError(404, "category not found"));
    }

    const productExists = await Product.exists({ category: categoryId });
    if (productExists) {
        return next(new CustomError(400, "Category have a product. Reassign or remove the product first"))
    }

    const parentCategoryExists = await Category.exists({ parentCategoryId: categoryId, isDeleted: false });

    if (parentCategoryExists) {
        return next(new CustomError(400, "Category have Subcategory. Handle them befor deleating"))
    }

    existingCategory.isDeleted = true;
    existingCategory.deletedAt = Date.now();
    existingCategory.deletedBy = userId;


    const updateCategory = await existingCategory.save();

    if (!updateCategory) {
        return next(new CustomError(500, "Failed to delete the category please try again letter"))
    }

    res.status(200).json({
        success: true,
        message: "Category is deleted successfully"
    })

});


//@ delete deal
const deleteDeal = AsyncHandler(async (req, res, next) => {
    const productId = req.params.productId;
    const dealId = req.params.id;

    (!mongoose.Types.ObjectId.isValid(productId)) && next(new CustomError(400, "Invalid the product ID"));
    (!mongoose.Types.ObjectId.isValid(dealId))  && next(new CustomError(400, "Invalid the deal ID"));
    

    const product =await Product.findById(productId);

    if(!product){
        return next(new CustomError(400, "Product is not found"));
    }

    const deal = await Deal.findById(dealId);
    if(!deal){
        return next(new CustomError(400, "Can't find the deal"));
    }
    
    const deleteDeal = await Deal.findByIdAndDelete(dealId)
    if(!deleteDeal) {
        return next(new CustomError(500, "Failed to delete the deal plese try again letter."))
    }

    res.status(200).json({
        success: true,
        message: "Deal is deleated successfully"
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

// @ get the deal

const getDeal = AsyncHandler(async(req, res, next)=>{
    const productId = req.params.productId;
    const dealId = req.params.id;

    (!mongoose.Types.ObjectId.isValid(productId)) && next(new CustomError(400, "Invalid product ID"));
    (!mongoose.Types.ObjectId.isValid(dealId)) && next(new CustomError(400, "Invalid deal ID"));

    const existingProduct = await Product.findById(productId);
    if(!existingProduct){
        return next( new CustomError(404, "Product is not not found"));
    }

    const existingDeal = await Deal.findById(dealId).select("Discount startDate endDate");

    if(!existingDeal){
        return next(new CustomError(404, "Deal not found"))
    }

    res.status(200).json({
        success: true,
        message: "Deal fetched successfully",
        existingDeal
    });
});

//@ get the category 

const getCategory = AsyncHandler(async(req, res, next)=>{
    const id = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new CustomError(400, "Invalid Category ID"));
    }
     
    const category = await Category.findById(id).select("name slug");

    if(!category){
        return next(new CustomError(404, "Categoy is found"));
    }
    res.status(200).json({
        sucess: true,
        message: "Category fetched successfully",
        category
    });


});


export { createProduct, createCategory, getAllAdminProducts, createDeal, editDeals, editProduct, deleteProduct, editCategory, deleteCategory, deleteDeal, getProduct, getDeal , getCategory}