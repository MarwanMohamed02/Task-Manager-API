import mongoose from "mongoose";



// Connecting mongoose to the db
mongoose.connect(process.env.MONGODB_URL as string);



