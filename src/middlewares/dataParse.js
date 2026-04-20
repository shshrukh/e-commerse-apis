import AsyncHandler from "../handlers/AsyncHandler.js";
import Category from "../models/category.model.js";

const parsedData = AsyncHandler(async (req, res, next) => {
    let dealsParsed;

    if (req.body.deals && req.body.deals !== "null" && req.body.deals !== "undefined") {
        try {
            dealsParsed = JSON.parse(req.body.deals);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Invalid JSON in deals field"
            });
        }
    }

    const parsed = {
        name: req.body.name,
        price: req.body.price ? Number(req.body.price) : undefined,
        stock: req.body.stock ? Number(req.body.stock) : undefined,
        category: req.body.category,
        discription: req.body.discription,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
        deals: (dealsParsed && Object.keys(dealsParsed).length > 0) ? dealsParsed : undefined,
        Images: req.files && req.files.length > 0 ? req.files : []
    };

    // Replace req.body with parsed data for Zod validation
    req.body = parsed;

    console.log("Parsed Data:", req.body);
    console.log("Files:", req.files?.length);

    next();
});

export { parsedData };