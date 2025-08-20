import mongoose,{Schema} from "mongoose";

const solutionSchema = new Schema(
    {
      qid: {
        type: Schema.Types.ObjectId,
        ref: "question",//miitesh
        required: true,
      },
      explanation: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      timing: {
        type: Number, // Time taken in seconds or minutes (modify as needed)
        required: true,
      },
      by_uid: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      tags:[],
      comments: [
        {
          by: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
          },
          comment: {
            type: String,
            required: true,
          },
          datetime: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    { minimize: false }
);

const solutionModel =mongoose.models.solution || mongoose.model("solution", solutionSchema);
export default solutionModel;