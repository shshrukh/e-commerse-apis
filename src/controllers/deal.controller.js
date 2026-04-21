import AsyncHandler from "../handlers/AsyncHandler.js";
import CustomError from "../handlers/CustomError.js";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { Deal } from "../models/deals.model.js";
import User from "../models/user.models.js";

//@ create deals

const createDeal = AsyncHandler(async (req, res, next) => {
  const { discount, startDate, endDate } = req.body;
  const user = req.user;
  const productId = req.params.productId;
console.log(productId, "the product id");
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new CustomError(400, "Invalid product ID"));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deal = await Deal.create([{ discount, startDate, endDate,product:productId,user:user._id }], {
      session,
    });

    const product = await Product.findOneAndUpdate(
      { _id: productId, activeDeal: null, isActive: true },
      { activeDeal: deal[0]._id },
      { new: true, session },
    );
    console.log(product, "the product");

    if (!product) {
      throw new CustomError(
        400,
        "Cannot create deal: product may not exist or already has a deal",
      );
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Deal is created successfully",
      deal: deal[0]
    });
  } catch (error) {
    await session.abortTransaction();
    return next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Failed to create a deal"),
    );
  } finally {
    session.endSession();
  }
});

// @ get all deals

const getDeal = AsyncHandler(async (req, res, next) => {
  const deals = await Deal.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    
    {
      $match: {
        "user.role": "admin",
      },
    },
    
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    
    {
      $project: {
        _id: 1,
        discount: 1,
        startDate: 1,   // ✅ added
        endDate: 1,     // ✅ added
        "product._id": 1,
        "product.name": 1,
        "user._id": 1,
      },
    }
  ]);
  if(!deals || deals.length === 0) {
    return next(new CustomError(404, "No deals found"));
  }
  res.status(200).json({
    success: true,
    data: deals,
  });
});

// edit deal
const editDeals = AsyncHandler(async (req, res, next) => {
  const productId = req.params.productId;
  const dealId = req.params.dealId;
  const { discount, startDate, endDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(400, "Invalid product ID");
  }
  if (!mongoose.Types.ObjectId.isValid(dealId)) {
    return next(400, "Invalid deal ID");
  }

  const deal = await Deal.findOne({ _id: dealId, product: productId });
  if (!deal) {
    return next(
      new CustomError(
        404,
        "No active deal found for this product with the provided deal ID",
      ),
    );
  }

  Object.assign(deal, { discount, startDate, endDate });

  try {
    const updateDeal = await deal.save({ runValidators: true });

    return res.status(200).json({
      success: true,
      message: "Deal updated successfully",
      deal: updateDeal,
    });
  } catch (error) {
    return next(
      new CustomError(500, "Failed to update the deal, please try again later"),
    );
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
    const product = await Product.findOne({
      _id: productId,
      activeDeal: dealId,
    }).session(session);
    if (!product) {
      throw new CustomError(
        404,
        "Product not found or deal is not assigned to this product",
      );
    }

    const deal = await Deal.findByIdAndDelete(dealId, { session });
    if (!deal) {
      throw new CustomError(
        500,
        "Failed to delete the deal. Please try again later.",
      );
    }

    product.activeDeal = null;
    await product.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Deal deleted successfully",
      product,
    });
  } catch (error) {
    await session.abortTransaction();
    return next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Failed to delete the deal."),
    );
  } finally {
    session.endSession();
  }
});

const getAllDeals = AsyncHandler(async (req, res, next) => {
  const deals = await Deal.find();
  res.status(200).json({
    success: true,
    data: deals,
  });
});

// @ get current active deal for product
const getCurrentProductDeal = AsyncHandler(async (req, res, next) => {
  const { productId } = req.params;


  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new CustomError(400, "Invalid product ID"));
  }

  const product = await Product.findOne({ _id: productId, isActive: true })
    .select("_id name price activeDeal")
    .lean();

  if (!product) {
    return next(new CustomError(404, "Product not found"));
  }


  if (!product.activeDeal) {
    return next(new CustomError(404, "No active deal found for this product"));
  }

  const now = new Date();

  const deal = await Deal.findOne({
    _id: product.activeDeal,
    product: productId
  })
    .select("_id discount startDate endDate product")
    .lean();

  if (!deal) {
    return next(new CustomError(404, "No current deal found for this product"));
  }

  return res.status(200).json({
    success: true,
    data: {
      product,
      deal,
    },
  });
});

export {
  createDeal,
  deleteDeal,
  getDeal,
  editDeals,
  getAllDeals,
  getCurrentProductDeal,
};
