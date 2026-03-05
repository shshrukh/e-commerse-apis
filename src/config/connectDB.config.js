import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
        console.log(`MongoDB connected database: ${connectionInstance.connection.name}`);
        return connectionInstance;

    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error?.message || error}`);
        process.exit(1)
    }
}

export {connectDB}