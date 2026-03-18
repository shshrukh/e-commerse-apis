import express from "express";
import ErrorMiddleware from "./src/middlewares/ErrorMiddleware.js";
import dotenv from "dotenv";
import { authRouter } from "./src/routes/auth.route.js";
import { userRouter } from "./src/routes/user.route.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { productRoute } from "./src/routes/product.route.js";
import { adminRoute } from "./src/routes/admin.route.js";
import "./src/events/index.js"; // Initialize event listeners
import multer from "multer";


dotenv.config();



const app = express();

// implementing the cors middleware
const allowedOrigins = ['http://localhost:8000', 'http://localhost:5173', 'http://localhost:5174'];



const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, { origin: true, methods: ["GET"] });
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, {
                origin: true,
                methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                credentials: true
            });
        }else{
            return callback(null,
                {
                    origin: true,
                    methods: ["GET"],
                    credentials: true
                }
            )
        }
    }
}

app.use(cors(corsOptions));




// appling the rate limiter middleware
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes,
    limit: 100, // limit each IP to 100 requests per windowMs
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    standardHeaders: true, // Enable the `RateLimit-*` headers;

    handler: (req, res, next) => {
        const ip = req.ip;
        console.log(`too many request form ${ip}`);
        return res.status(429).json({
            success: false,
            message: "Too many requests, please try again later."
        });
    }
})

app.use(globalLimiter);


//middleware to parse json data
app.use(express.json());

//middleware to parse urlencoded data
app.use(express.urlencoded({ extended: true }));
// implementing the cookie parser middleware
app.use(cookieParser());


// implementing the auth routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/porduct', productRoute);
app.use('/api/v1/admin', adminRoute)


// multer middleware";

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
});

//implementing the error middleware
app.use(ErrorMiddleware);


export default app;