import mongoose, { Schema, model } from "mongoose";



const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    slug: {
        type: String,
        required: true,
        minLength: [3, "category should have at least three characters"],
        unique: true,
        lowercase: true
    },
    parentCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }

}, { timestamps: true });

categorySchema.index({ name: 1 });
categorySchema.index({ parentCategoryId: 1 });

const Category = model("Category", categorySchema);


export default Category;