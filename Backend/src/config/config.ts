import dotenv from "dotenv"

dotenv.config()

type CONFIG = {
    readonly MONGO_URI : string
}

if(!process.env.MONGO_URI) {
    throw new Error ("Mongo_URI is not defined in environment variables")
}

//created a config named object of type CONFIG
export const config: CONFIG= {
    MONGO_URI : process.env.MONGO_URI!
}