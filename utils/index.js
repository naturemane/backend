
import mongoose from "mongoose";


 const dbConnection = async()=> {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected")
    } catch (error) {
        console.log("Database not connected")
    }
}

export default dbConnection;