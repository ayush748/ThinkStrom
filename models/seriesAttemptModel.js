import mongoose, { Schema } from "mongoose";

const seriesAttemptSchema = new Schema({
    uid: {
        type: Schema.Types.ObjectId,
        ref: "user", 
        required: true,
    },
    sid: {
        type: Schema.Types.ObjectId,
        ref: "series", 
        required: true,
    },
    lastAttempted: {
        type: Number, 
        default: () => Date.now(),
    },
    besttime: {
        type: Number, 
        default: null,
    }
}, { minimize: false });

const seriesAttemptModel = mongoose.models.seriesAttempt || mongoose.model("seriesAttempt", seriesAttemptSchema);
export default seriesAttemptModel;
