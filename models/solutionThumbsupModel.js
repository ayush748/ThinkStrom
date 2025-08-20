import mongoose, { Schema } from "mongoose";

const solutionThumbsupSchema = new Schema(
    {
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
    },
{ minimize: false });


const solutionThumbsupModel =mongoose.models.solutionThumbsup || mongoose.model("solutionThumbsup", solutionThumbsupSchema);
export default solutionThumbsupModel;