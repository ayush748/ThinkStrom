import mongoose from "mongoose";


const MONGO_URL = "mongodb+srv://miiteshverma4:thinkstrom123@cluster0.6casb.mongodb.net/Think_Strom?retryWrites=true&w=majority";

const connectDB = async (  ) =>{

    mongoose.connection.on('connected',()=>{
        console.log("DB connected")
    })

    await mongoose.connect(`${MONGO_URL}`);

}

export default connectDB;