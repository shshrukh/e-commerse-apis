import mongoose, {Schema, model} from "mongoose";


const productSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        lowercase: true,
        minLength: [3, "Product name should have at least 3 characters"]
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    deals:[
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            discount: { type: Number, default: 0},
            startedDate: { type: Number, default: Date.now()},
            endDate: { type: Date}
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    }
},{timestamps: true})

productSchema.index({name: 1});
productSchema.index({category: 1});
productSchema.index({user: 1});
productSchema.index({price: 1});

export const Product = model("Product", productSchema);