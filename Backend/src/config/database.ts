import mongoose from "mongoose";
import { config } from "./config.js"

export const connecToDatabase = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
    } catch(error) {
        console.log("Error connecting to Database: ", error)
        throw error
    }
}