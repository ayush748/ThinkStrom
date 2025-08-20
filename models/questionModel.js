import mongoose,{Schema} from "mongoose";


const questionSchema=new Schema({
    statement:{
        type:String,
        required:true,
    },
    tags: [],
    difficulty:{
        type:String,
        enum: ["Easy", "Medium", "Hard"],
    },
    answer:[],
    type:{
        mcq:{},
        answer:{},
    },
    options:[],

});
const questionModel=mongoose.model("question",questionSchema);
export default questionModel;
