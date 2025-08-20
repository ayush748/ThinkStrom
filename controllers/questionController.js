import express from "express";
import questionModel from "../models/questionModel.js";
import questionThumbsUp from "../models/questionThumbsUp.js";
import questionThumbsDown from "../models/questionThumbsDown.js";
import solvedAns from "../models/solvedAns.js";



// export { attemptQuestion } from "../controllers/questionController.js"

const allQuestions = async(req,res)=>{
    try{
        const questions=await questionModel.find();
        res.json({success:true,message:{questions}});
    }catch(err){
        res.json({success:false,message:err.message})
    }
};


const addQuestion = async(req,res)=>{
    try{
        res.json({success:true,message:"req from authenticate user"});
    }catch(err){
        res.json({success:false,message:"req from non-authenticate user"})
    }
}

// this submit logic
const submitQuestion = async (req, res) => {
    console.log(req.body); // Log request body for debugging

    try {
        if (!req.body.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const userId = req.body.userId;
        const { qid,status } = req.body;

        if (!qid) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: qid" 
            });
        }

        const questionExists = await questionModel.exists({ _id: qid }); // Uses `.exists()` for efficiency
        if (!questionExists) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        // if(status == "solved"){
            const existingAttempt = await solvedAns.findOneAndUpdate(
                { qid, userId, },
                { $set: { lastattempted: new  Date(),status} },
                { new: true, upsert: true } // Creates if not exists
            );
        // }


        res.status(200).json({ success: true, message: "ACK" });

    } catch (error) {
        console.error("Error in submitQuestion:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// save my space 
const saveMyspace = async (req, res) => {
    try {
        // Ensure user is authenticated
        if (!req.body.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const userId = req.body.userId;
        const { qid, myspace } = req.body;

        // Validate input
        if (!qid || myspace === undefined) {
            return res.status(400).json({ success: false, message: "Missing qid or myspace" });
        }

        // Check if the question exists
        if (!(await questionModel.findById(qid))) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        // Update or insert myspace
        await solvedAns.findOneAndUpdate(
            { qid, userId },
            { myspace, myspacelastdate: new Date() },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, message: "MySpace saved successfully" });

    } catch (error) {
        console.error("Error in saveMyspace:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



const getQuestion=async(req,res)=>{
    console.log("Received request at /filterQuestions",);
    try {
        const { qid, userId } = req.body; 
        console.log(req.body);
        if (!qid) {
            return res.status(400).json({ error: "Question ID is required" });
        }

        const question = await questionModel.findById(qid);
        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        const thumbsUpCount = await questionThumbsUp.countDocuments({ qid });
        const thumbsDownCount = await questionThumbsDown.countDocuments({ qid });

        const isThumbsUp = await questionThumbsUp.findOne({ qid, userId }) ? true : false;

        const isThumbsDown = await questionThumbsDown.findOne({ qid, userId }) ? true : false;

        const similarQuestions = await questionModel.find({
            _id: { $ne: qid },
            tags: { $in: question.tags },
            difficulty: question.difficulty, 
        }).limit(5); 

        const solvedAns1 = await solvedAns.findOne({ qid, userId });
        console.log(solvedAns1,userId)

        const response = {
            questionModel: question,
            thumbsUpCount,
            thumbsDownCount,
            isThumbsUpbyUser: isThumbsUp,
            isThumbsDownbyUser: isThumbsDown,
            similarQuestions,
            solvedAnsModel: solvedAns1 
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching question details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const attemptQuestion=async(req,res)=>{
    try{
        const {questionId}=req.params;
        const {userId,submitted_answer}=req.body;
        const question = await questionModel.findById(questionId);
        if(!question)
        {
            return res.status(404).json({message:"Question not found"});
        }
        const correctAnswer="expected_correct_answer";
        if(submitted_answer===correctAnswer)
        {
            const updatedQuestion=await questionModel.findByIdAndUpdate(
                questionId,
                {$inc:{attempted_by: 1}},
                {new:true}
            );
            await userModel.findByIdAndUpdate(userId,{
                $addToSet:{solvedQuestions:questionId}
            })
            return res.json({
                message:"Correct answer!Attempt recorded.",
                attempted_by:updatedQuestion.attempted_by
            });
        }else{
            return res.json({ message: "Incorrect answer! Try again." });
        }

    }
    catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
// console.log("here 2");
const filterQuestions = async (req, res) => {
    // console.log(req.body);
    try {
        const { type, difficulty, tags, status, query, userId,} = req.body;
        let filter = {};

        if (type && type !== "any") filter.type = type;
        if (difficulty && difficulty !== "any") filter.difficulty = difficulty;
        if (tags && tags.length > 0) filter.tags = { $all: tags };
        if (query) filter.statement = { $regex: query, $options: "i" };

        let questions = await questionModel.find(filter).lean();


        const filter2 = {userId}
        if(status != "any"){
            filter2.status = status;
        }
        const filteredQuestions = await Promise.all(
            questions.map(async (q) => ({
                ...q,
                solvedAns: await solvedAns.findOne({...filter2,qid: q._id ,})
            }))
        );

        return res.json({ success: true, questions: filteredQuestions });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "server error" });
    }
};
// this is upvote logic

const upvoteQuestion = async (req, res) => {
    try {
        const { qid } = req.body;
        console.log(req.body.userId)
        const user_id = req.body.userId;

        if (!qid) {
            return res.status(400).json({ success: false, message: "Question ID is required" });
        }

        // Check if the question exists
        const question = await questionModel.findById(qid);
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        // Check if user already upvoted
        const existingUpvote = await questionThumbsUp.findOne({ userId: user_id, qid: qid });

        if (existingUpvote) {
            // If user already upvoted, remove the upvote (toggle)
            await questionThumbsUp.deleteOne({ userId: user_id, qid: qid });
            return res.status(200).json({ success: true, message: "Upvote removed" });
        } else {
            // If user has downvoted earlier, remove downvote first
            await questionThumbsDown.deleteOne({ userId: user_id, qid: qid });

            // Add new upvote
            const newUpvote = new questionThumbsUp({ userId: user_id, qid: qid });
            await newUpvote.save();

            return res.status(200).json({ success: true, message: "Upvoted successfully" });
        }

    } catch (error) {
        console.error("Error in upvoteQuestion:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
// Downvote Logic
// Same logic applies for downvotes but in reverse:

// If the user already downvoted → Remove downvote.
// If the user upvoted earlier → Remove upvote & add downvote.

const downvoteQuestion = async (req, res) => {
    try {
        const { qid } = req.body;
        const user_id = req.body.userId;

        if (!qid) {
            return res.status(400).json({ success: false, message: "Question ID is required" });
        }

        // Check if the question exists
        const question = await questionModel.findById(qid);
        if (!question) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        // Check if user already downvoted
        const existingDownvote = await questionThumbsDown.findOne({ userId: user_id, qid: qid });

        if (existingDownvote) {
            // If user already downvoted, remove the downvote (toggle)
            await questionThumbsDown.deleteOne({ userId: user_id, qid: qid });
            return res.status(200).json({ success: true, message: "Downvote removed" });
        } else {
            // If user has upvoted earlier, remove upvote first
            await questionThumbsUp.deleteOne({ userId: user_id, qid: qid });

            // Add new downvote
            const newDownvote = new questionThumbsDown({ userId: user_id, qid: qid });
            await newDownvote.save();

            return res.status(200).json({ success: true, message: "Downvoted successfully" });
        }

    } catch (error) {
        console.error("Error in downvoteQuestion:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



export { allQuestions, filterQuestions, getQuestion,submitQuestion, saveMyspace,upvoteQuestion,downvoteQuestion};

