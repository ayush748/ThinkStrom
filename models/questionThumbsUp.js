import mongoose,{Schema} from "mongoose";
const questionThumbsUpSchema=new Schema({
    qid:{
        type:Schema.ObjectId,
        ref:"question",
    },
    userId:{
        type:Schema.ObjectId,
        ref:"user",
    },
});

const questionThumbsUpModel=mongoose.model("questionThumbsUp",questionThumbsUpSchema);
export default questionThumbsUpModel;
