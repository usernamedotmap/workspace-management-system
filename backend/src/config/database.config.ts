import mongoose from "mongoose"
import { config } from "./app.config"

const connectDatabase = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI);
        console.log("Connected to Database");
    } catch (error) {
        console.log(error, "Error connecting to databse");
      process.exit(1);
    }
}

export default connectDatabase;