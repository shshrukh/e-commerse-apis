import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minLength: [3, "Name must be at least 3 characters long"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        required: [true, "Email is required"],
        match: [/\S+@\S+\.\S+/, "Please use a valid email address"]
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Password must be at least 8 characters long"],
        select: false
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    refreshToken: [
        {
            token: {
                type: String,
                default: null,
                select: false
            },
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    verificationToken: {
        type: String,
        default: null
    },
    verificationTokenExpiry: {
        type: Date,
        default: null
    },
    addresses:[
        {
            city: {type: String, required: true, trim: true},
            country: {type: String, required: true, trim: true},
            zip: {type: Number, required: true, trim: true}
        }
    ]
}, { timestamps: true });


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const hashPassword = await bcrypt.hash(this.password, 10);
    this.password = hashPassword;
});

userSchema.methods.comparePassword = async function (password) {
    const isPasswordCorrect = await bcrypt.compare(password, this.password);
    return isPasswordCorrect;
}

const User = model("User", userSchema);

export default User;