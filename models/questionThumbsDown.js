import mongoose,{Schema} from "mongoose";
const questionThumbsDownSchema=new Schema({
    qid:{
        type:Schema.ObjectId,
        ref:"question",
    },
    userId:{
        type:Schema.ObjectId,
        ref:"user",
    },
});

const questionThumbsDownModel=mongoose.model("questionThumbsDown",questionThumbsDownSchema);
export default questionThumbsDownModel;
