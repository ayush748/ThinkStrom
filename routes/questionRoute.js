import express from "express";
import { allQuestions, filterQuestions, getQuestion, submitQuestion,saveMyspace, upvoteQuestion, downvoteQuestion  } from "../controllers/questionController.js";

import authUser from "../middleware/auth.js";
import checkAuth from "../middleware/checkAuth.js";


const questionRouter = express.Router();

// questionRouter.get('/allQuestions',allQuestions);
// questionRouter.post('/allQuestions',authUser,allQuestions);
// questionRouter.post('/addQuestion',authUser,allQuestions);
// filter wala logic
questionRouter.post('/filterQuestions',checkAuth,filterQuestions);
questionRouter.post('/getQuestion',checkAuth,getQuestion);
questionRouter.post('/submitquestions',authUser,submitQuestion);
questionRouter.post("/saveMyspace", authUser,saveMyspace);
questionRouter.post("/upvote", authUser,upvoteQuestion);
questionRouter.post("/downvote", authUser,downvoteQuestion);


export default questionRouter;