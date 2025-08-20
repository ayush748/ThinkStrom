import mongoose, { Schema } from "mongoose";

const solvedAnsSchema = new Schema({
    qid: {
        type: Schema.Types.ObjectId,
        ref: "question",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    myspace: {
        type: String,
        default: ""
    },
    myspacelastdate: {
        type: Number, // Storing timestamp of last myspace change
        default: () => Date.now()
    },
    status: {
        type: String,
        enum: ["solved", "attempted"],
        default: "attempted" // By default, user has attempted but not solved
    },
    lastattempted: {
        type: Number, // Last time user attempted this question
        default: () => Date.now()
    }
}, { minimize: false });

const solvedAnsModel = mongoose.models.solvedAns || mongoose.model("solvedAns", solvedAnsSchema);
export default solvedAnsModel;
