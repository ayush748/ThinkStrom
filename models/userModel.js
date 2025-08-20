import mongoose,{Schema} from "mongoose";


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    Solved_Question:{
        question_id:{
            type:Schema.Types.ObjectId,
            ref:"question",
        },
        Notes:{
            type:String,
        }
    }

    
},{minimize:false})


const userModel = mongoose.models.user || mongoose.model("user",userSchema)
export default userModel;