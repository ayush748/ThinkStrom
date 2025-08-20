import express from "express";
import { addThumbsUp, removeThumbsUp ,postSolution, getSolution,getUserExplanation,deleteUserExplanation} from "../controllers/solutionController.js";
import  authUser  from "../middleware/auth.js"; // Import authUser middleware
import checkAuth from "../middleware/checkAuth.js";

const solutionRouter = express.Router();

solutionRouter.post("/thumbsUpSolution", authUser, addThumbsUp);
solutionRouter.post("/thumbsDownSolution", authUser, removeThumbsUp);
solutionRouter.post("/postSolution", authUser, postSolution);
solutionRouter.post("/getSolution", checkAuth ,getSolution);
solutionRouter.post("/getUserExplanation",authUser,getUserExplanation);
solutionRouter.post("/deleteUserExplanation",checkAuth,deleteUserExplanation);

export default solutionRouter;
