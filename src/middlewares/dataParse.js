import AsyncHandler from "../handlers/AsyncHandler.js";
import Category from "../models/category.model.js";

const parsedData = AsyncHandler(async (req, res, next) => {
    let dealsParsed = {};
    
    
    try {
        dealsParsed = req.body.deals ? JSON.parse(req.body.deals) : {};
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON in deals field"
        });
    }

    const parsed = {
        name: req.body.name,
        price: req.body.price ? Number(req.body.price) : undefined,
        stock: req.body.stock ? Number(req.body.stock) : undefined,
        category: req.body.category,
        discription: req.body.discription,
        isActive: req.body.isActive === "true",
        deals: dealsParsed,
        Images: req.files || []
    };

    // ✅ Merge instead of overwrite
    req.body = parsed

    console.log(req.body);
    
    next();
});

export { parsedData };