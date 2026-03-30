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

//@ delete deal

const deleteDeal = AsyncHandler(async (req, res, next) => {
    const productId = req.params.productId;
    const dealId = req.params.dealId;

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

// @ get the deal

const getDeal = AsyncHandler(async(req, res, next)=>{
    const productId = req.params.productId;
    const dealId = req.params.dealId;

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

// edit deal
const editDeals = AsyncHandler(async (req, res, next) => {

    const productId = req.params.productId;
    const dealId = req.params.dealId;
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

export {createDeal, deleteDeal, getDeal, editDeals}