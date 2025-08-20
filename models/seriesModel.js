import mongoose, { Schema } from "mongoose";

const seriesSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    by: {
        type: Schema.Types.ObjectId,
        // ref: "user", 
        required: true,
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: "question", 
        }
    ],
    tags: [],
}, { minimize: false });

const seriesModel = mongoose.models.series || mongoose.model("series", seriesSchema);
export default seriesModel;
