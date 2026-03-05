import mongoose, {Schema, model} from "mongoose";
 
const orderItemSchema = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
    
},{_id: false });



const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: {
        type: [orderItemSchema],
        validate: [
            arr => arr.length > 0,
            "Order must have at least one item"
        ]
    },
    totalAmount: {
        type: Number,
        required: true
    },
    addressSnapshot: {
        city: {type: String, required: true},
        country: {type: String, required: true},
        zip:{type: Number, required: true}
    },
    orderStatus: {
        type: String,
        enum:["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    paymentStatus:{
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    }

},{timestamps:true})

orderSchema.index({user: 1});
orderSchema.index({orderStatus: 1, paymentStatus: 1});

const Order = model("Order", orderSchema);


export default Order;




