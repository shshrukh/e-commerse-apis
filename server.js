import app from "./app.js";
import { connectDB } from "./src/config/connectDB.config.js";
const PORT = process.env.PORT || 4000;



connectDB()
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
        })
    }).catch((err)=>{
        console.error(`Failed to connect to the database: ${err?.message || err}`);
    })

