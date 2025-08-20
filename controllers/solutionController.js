import SolutionThumbsUp from "../models/solutionThumbsupModel.js";
import SolutionThumbsDown from "../models/solutionThumbsDownModel.js";
import mongoose from "mongoose";
import questionModel from "../models/questionModel.js";
import solutionModel from "../models/solutionModel.js";
// import upvoteModel from "../models/upvoteModel.js";

export const postSolution = async (req, res) => {
  try {
    const { qid, explanation, title, userId, tags } = req.body;
    console.log(tags)
    // Validate required fields
    if (!qid || !explanation || !title || !userId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the question exists
    const questionExists = await questionModel.findById(qid);
    if (!questionExists) {
      return res.status(404).json({ message: "Question not found." });
    }

    const existingSolution = await solutionModel.findOne({ qid, by_uid: userId });

    if (existingSolution) {
      existingSolution.title = title;
      existingSolution.explanation = explanation;
      existingSolution.timing = new Date().valueOf();
      existingSolution.tags = tags; 

      await existingSolution.save();

      return res.status(200).json({ message: "Solution updated successfully", solution: existingSolution,success:true });
    } else {
      const newSolution = new solutionModel({
        qid,
        explanation,
        title,
        tags: tags || [],
        timing: new Date().valueOf(),
        by_uid: userId,
      });

      await newSolution.save();

      return res.status(201).json({ message: "Solution posted successfully", solution: newSolution,success:true });
    }
  } catch (error) {
    console.error("Error posting solution:", error);
    return res.status(500).json({ message: "Server error", error: error.message,success:false });
  }
};


export const getSolution = async (req, res) => {
  console.log(req.body)
  try {
    const { qid } = req.body;

    if (!qid) {
      return res.status(400).json({ success: false, message: "Question ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(qid)) {
      return res.status(400).json({ success: false, message: "Invalid Question ID format" });
    }

    const questionId = new mongoose.Types.ObjectId(qid);

    const solutions = await solutionModel.find({ qid: questionId }).populate("by_uid", "username");

    if (!solutions || solutions.length === 0) {
      return res.status(200).json({ success: true, solutions: [] });
    }

    const solutionIds = solutions.map((solution) => solution._id);
    const upvotes = await SolutionThumbsUp.aggregate([
      { $match: { sid: { $in: solutionIds } } },
      { $group: { _id: "$sid", upvoteCount: { $sum: 1 } } },
    ]);

    const upvoteMap = new Map(upvotes.map((vote) => [vote._id.toString(), vote.upvoteCount]));

    const solutionArray = solutions.map((solution) => ({
      _id: solution._id,
      by_uid: solution.by_uid ? solution.by_uid._id : null, 
      by_user_name: solution.by_uid ? solution.by_uid.username : "Unknown User",
      title: solution.title,
      explanation: solution.explanation,
      timing: solution.timing,
      tags: solution.tags,
      commentsCount: solution.comments.length,
      upvoteCount: upvoteMap.get(solution._id.toString()) || 0,
      isSolutionLikedByUser: false,
    }));
    

    res.status(200).json({ success: true, solutions: solutionArray });
  } catch (error) {
    console.error("Error fetching solutions:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const addThumbsUp = async (req, res) => {
  console.log(req.body);
  try {
    const { userId, sid } = req.body;

    // Remove thumbs down if it exists
    await SolutionThumbsDown.deleteOne({ userId, sid });

    // Add thumbs up
    const thumbsUp = await SolutionThumbsUp.create({ userId, sid });

    res
      .status(201)
      .json({ success: true, message: "Thumbs up added", thumbsUp });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Already liked this solution" });
    }
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

export const removeThumbsUp = async (req, res) => {
  try {
    const { userId, sid } = req.body;

    const deleted = await SolutionThumbsUp.findOneAndDelete({ userId, sid });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Thumbs up not found" });
    }

    res.status(200).json({ success: true, message: "Thumbs up removed" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

export const getUserExplanation =async (req, res) => {
  try {
      const { userId, qid } = req.body; 

      if (!userId || !qid) {
          return res.status(400).json({ message: "User ID and Question ID are required" });
      }

      const userSolution = await solutionModel
          .findOne({ qid, by_uid: userId }) 
          .populate("by_uid", "username") 
          .populate("comments.by", "username"); 

      if (!userSolution) {
          return res.json({message: "No explanation found for this user" });
      }

      res.json({explaination:userSolution,success:true,});
  } catch (error) {
      res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteUserExplanation = async (req, res) => {
  try {
    const { userId, qid } = req.body;

    if (!userId || !qid) {
      return res.status(400).json({ success: false, message: "User ID and Question ID are required" });
    }

    const deletedSolution = await solutionModel.findOneAndDelete({ by_uid: userId, qid });

    if (!deletedSolution) {
      return res.status(404).json({ success: false, message: "Explanation not found or already deleted" });
    }

    res.status(200).json({ success: true, message: "Explanation deleted successfully" });
  } catch (error) {
    console.error("Error deleting explanation:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};