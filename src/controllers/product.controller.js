import AsyncHandler from "../handlers/AsyncHandler.js";
import CustomError from "../handlers/CustomError.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";
import { Deal } from "../models/deals.model.js";
import Category from "../models/category.model.js";
import { fileTypeFromBuffer } from "file-type";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import User from "../models/user.models.js";

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}





//@ get all admin products
const getAllAdminProducts = AsyncHandler(async (req, res) => {
    const user = req.user;
    const { page = 1, limit = 100 } = req.query;

    const totalProducts = await Product.countDocuments({ user: user._id });

    const products = await Product.find({ user: user._id })
        .select("name price stock isActive activeDeal") // include only these
        .populate({
            path: "activeDeal",
            select: "discount startDate endDate user"
        })
        .limit(Number(limit))
        .skip((page - 1) * limit)
        .lean();
    const meta = {
        page,
        limit,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit)
    };

    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: { products },
        meta
    });
});

// @ create Product controller

const createProduct = AsyncHandler(async (req, res, next) => {

    const { name, price, stock, isActive, category, deals, discription } = req.body
    console.log(name, price, stock, isActive, category, deals, discription);
    const files = req.files;
    console.log(files);

    const user = req.user;

    const productImage = [];

    for (const file of files) {
        const detectedType = await fileTypeFromBuffer(file.buffer);

        if (!detectedType || !["image/jpeg", "image/png"].includes(detectedType.mime)) {
            return next(new CustomError(400, "Invalid image file"));
        }

        try {
            const result = await uploadToCloudinary({
                resource_type: "image",
                buffer: file.buffer,
                folder: "E-commerce_products",
                transformation: [{ quality: "auto" }]
            });

            productImage.push(result.secure_url);
        } catch (error) {
            return next(new CustomError(500, "Cloudinary upload failed"));
        }
    }

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
        return next(new CustomError(400, "Create the category before creating product first."));
    }

    if (deals) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { discount, startDate, endDate } = req.body.deals;
            const product = await Product.create({
                name,
                price,
                stock,
                category,
                isActive,
                discription,
                images: productImage,
                user: user._id
            });

            const deal = await Deal.create({
                discount,
                startDate,
                endDate,
                product: product._id,
                user: user._id
            });
            product.activeDeal = deal._id;
            console.log(deal);

            await product.save({ session })
            await session.commitTransaction();

            res.status(201).json({
                success: true,
                message: "Product is created successfully.",
                data: product
            })
        } catch (error) {
            await session.abortTransaction();
            console.log(error, "the error");

            return next(error instanceof CustomError ? new CustomError(500, "Failed to create a product") : error);
        } finally {
            session.endSession();
        }
    } else {

        const product = await Product.create({ name, price, stock, category, isActive, user: user._id, images: productImage, discription });

        if (!product) {
            return next(new CustomError(500, "Failed to create the product."));
        }

        res.status(201).json({
            success: true,
            message: "Product is created successfuly",
            data: product
        })
    }

});


//@ edit product 

const editProduct = AsyncHandler(async (req, res, next) => {
    const productId = req.params.productId;
    const { name, price, stock, isActive, category, discription } = req.body;
    const files = req.files;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new CustomError(400, "Invalid product ID"))
    }

    const updateData = { name, price, stock, isActive, category, discription };

    // If new images are uploaded, handle them
    if (files && files.length > 0) {
        const productImage = [];
        for (const file of files) {
            const detectedType = await fileTypeFromBuffer(file.buffer);
            if (!detectedType || !["image/jpeg", "image/png"].includes(detectedType.mime)) {
                return next(new CustomError(400, "Invalid image file"));
            }
            try {
                const result = await uploadToCloudinary({
                    resource_type: "image",
                    buffer: file.buffer,
                    folder: "E-commerce_products",
                    transformation: [{ quality: "auto" }]
                });
                productImage.push(result.secure_url);
            } catch (error) {
                return next(new CustomError(500, "Cloudinary upload failed"));
            }
        }
        updateData.images = productImage;
    }

    const product = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
    );

    if (!product) {
        return next(new CustomError(404, "Failed to update the product"))
    }
    res.status(200).json({
        success: true,
        message: 'product is updated successfully.',
        data: product
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
    const id = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new CustomError(400, "Invalid product ID"))
    }


    const product = await Product.findById(id).populate("activeDeal");

    if (!product) {
        return next(new CustomError(404, "Product not found"));
    }
    res.status(200).json({
        success: true,
        message: "Product fetched successfully",
        product
    });

});

const getAllProducts = AsyncHandler(async (req, res, next) => {
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
        return next(new CustomError(404, "No admin found"));
    }

    const data = await Product.find({ user: admin._id }).populate("activeDeal");

    if (!data || data.length === 0) {
        return next(new CustomError(404, "No products found for admin"));
    }

    res.status(200).json({
        success: true,
        data
    });
});

// @ get products by name or slug (query params)
const getProductsByNameOrSlug = AsyncHandler(async (req, res, next) => {
    const { name, slug, page = 1, limit = 10 } = req.query;

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
        return next(new CustomError(404, "No admin found"));
    }

    const filter = { user: admin._id, isActive: true };
    const or = [];

    if (name) {
        const nameStr = String(name).trim();
        if (nameStr) {
            or.push({ name: { $regex: escapeRegExp(nameStr.toLowerCase()), $options: "i" } });
        }
    }

    if (slug) {
        let slugStr = String(slug).trim();
        try {
            slugStr = decodeURIComponent(slugStr);
        } catch {
            // ignore malformed URI sequences
        }
        slugStr = slugStr.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

        if (slugStr) {
            or.push({ name: slugStr });
            or.push({ name: { $regex: escapeRegExp(slugStr), $options: "i" } });
        }
    }

    if (or.length > 0) {
        filter.$or = or;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
        .select("_id name price stock images discription isActive activeDeal category")
        .populate({ path: "activeDeal", select: "discount startDate endDate" })
        .populate({ path: "category", select: "name" })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .lean();

    res.status(200).json({
        success: true,
        message: "Products fetched successfully",
        data: { products },
        meta: {
            page: pageNum,
            limit: limitNum,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNum)
        }
    });
});


const getAdminStats = async (req, res, next) => {

    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    const dealCount = await Deal.countDocuments();

    res.status(200).json({
        success: true,
        data: {
            products: productCount,
            categories: categoryCount,
            deals: dealCount
        }
    })
};



export { createProduct, getAllAdminProducts, editProduct, deleteProduct, getProduct, getAdminStats, getAllProducts, getProductsByNameOrSlug }