import AsyncHandler from "../handlers/AsyncHandler.js";
import mongoose from "mongoose";
import Category from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import CustomError from "../handlers/CustomError.js";








//@ get the category 

const getCategory = AsyncHandler(async(req, res, next)=>{
    const id = req.params.categoryId;
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

//@ eidt category 

const editCategory = AsyncHandler(async (req, res, next) => {
    const { name, slug, parentCategoryId } = req.body;
    const categoryId = req.params.categoryId;
    
    const category = await Category.findById(categoryId);
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
        categoryId,
        updateData,
        { new: true }
    );

    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: updatedCategory
    });
});

// @ create Categoty

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

// @delete Category 

const deleteCategory = AsyncHandler(async (req, res, next) => {
    const categoryId = req.params.categoryId;
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




export {getCategory, deleteCategory, createCategory, editCategory}