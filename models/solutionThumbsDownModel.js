import mongoose, { Schema } from "mongoose";

const solutionThumbsDownSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  sid: {
    type: Schema.Types.ObjectId,
    ref: "solution",
    required: true,
  },
});

const solutionThumbsDownModel =mongoose.models.solutionThumbsDown || mongoose.model("solutionThumbsDown", solutionThumbsDownSchema);

export default solutionThumbsDownModel;