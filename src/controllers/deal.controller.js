import AsyncHandler from "../handlers/AsyncHandler.js";
import CustomError from "../handlers/CustomError.js";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Deal } from "../models/deals.model.js";


//@ create deals

const createDeal = AsyncHandler(async (req, res, next) => {
    const { discount, startDate, endDate } = req.body;
    const user = req.user;
    const productId = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new CustomError(400, "Invalid product ID"))
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const deal = await Deal.create([{ discount, startDate, endDate }], { session });

        const product = await Product.findOneAndUpdate(
            { _id: productId, activeDeal: null, isActive: true },
            { activeDeal: deal[0]._id },
            { new: true, session }
        );

        if (!product) {
            throw new CustomError(400, "Cannot create deal: product may not exist or already has a deal");
        }

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: "Deal is created successfully",
            deal: deal[0],
            product
        });
    } catch (error) {
        await session.abortTransaction();
        return next(error instanceof CustomError ? error : new CustomError(500, "Failed to create a deal"));
    } finally {
        session.endSession();
    }
});

// @ get the deal

const getDeal = AsyncHandler(async (req, res, next) => {
    const productId = req.params.productId;
    const dealId = req.params.dealId;

    (!mongoose.Types.ObjectId.isValid(productId)) && next(new CustomError(400, "Invalid product ID"));
    (!mongoose.Types.ObjectId.isValid(dealId)) && next(new CustomError(400, "Invalid deal ID"));

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
        return next(new CustomError(404, "Product is not not found"));
    }

    const existingDeal = await Deal.findById(dealId).select("Discount startDate endDate");

    if (!existingDeal) {
        return next(new CustomError(404, "Deal not found"))
    }

    res.status(200).json({
        success: true,
        message: "Deal fetched successfully",
        existingDeal
    });
});

// edit deal
const editDeals = AsyncHandler(async (req, res, next) => {

    const productId = req.params.productId;
    const dealId = req.params.dealId;
    const { discount, startDate, endDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(400, "Invalid product ID")
    }
    if (!mongoose.Types.ObjectId.isValid(dealId)) {
        return next(400, "Invalid deal ID")
    }

    const deal = await Deal.findOne({ _id: dealId, product: productId });
    if (!deal) {
        return next(new CustomError(404, "No active deal found for this product with the provided deal ID"));
    }

    Object.assign(deal, { discount, startDate, endDate });

    try {
        const updateDeal = await deal.save({ runValidators: true });

        return res.status(200).json({
            success: true,
            message: "Deal updated successfully",
            deal: updateDeal
        });
    } catch (error) {
        return next(new CustomError(500, "Failed to update the deal, please try again later"))
    }

});

const deleteDeal = AsyncHandler(async (req, res, next) => {
    const { productId, dealId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new CustomError(400, "Invalid product ID"));
    }
    if (!mongoose.Types.ObjectId.isValid(dealId)) {
        return next(new CustomError(400, "Invalid deal ID"));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        
        const product = await Product.findOne({ _id: productId, activeDeal: dealId }).session(session);
        if (!product) {
            throw new CustomError(404, "Product not found or deal is not assigned to this product");
        }

        const deal = await Deal.findByIdAndDelete(dealId, { session });
        if (!deal) {
            throw new CustomError(500, "Failed to delete the deal. Please try again later.");
        }

        product.activeDeal = null;
        await product.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: "Deal deleted successfully",
            product
        });
    } catch (error) {
        await session.abortTransaction();
        return next(error instanceof CustomError ? error : new CustomError(500, "Failed to delete the deal."));
    } finally {
        session.endSession();
    }
});

export { createDeal, deleteDeal, getDeal, editDeals }