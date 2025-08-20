import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import solvedAnsModel from "../models/solvedAns.js";
import questionModel from "../models/questionModel.js";


const createToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET);
}

// Login route
const loginUser = async (req,res) =>{

    try {
        const {email,password} = req.body;

        // checking user already exitst

        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"User doesn't exist"});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(isMatch){
            const token = createToken(user._id);
            res.json({success:true,token,user})
        }else{
            res.json({success:false,message:"invalid credentials"})
        }
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }



}


// Register user route
const registerUser = async (req,res)=>{

    try {
        const {username,email,password} = req.body;
        console.log(req.body)
        // checking user already exitst

        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message:'User already exists'});
        }

        // validating email format & pass
        // if(!validator.isEmail(email)){
        //     return res.json({success:false,message:"Please enter a valid email"})
        // }

        // if(password.length < 8){
        //     return res.json({success:false,message:"Please enter a strong password"})
        // }

        // hasing password
        const salt = await bcrypt.genSalt(10);
        const hashedpass = await bcrypt.hash(password,salt);

        const newUser = new userModel({
            username,email,password:hashedpass,
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({success:true,token,user})



    } catch (error) {
        res.json({success:false,message:error.message})
    }

}

const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Fetch user details
        const user = await userModel.findById(userId).select("username email");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Fetch solved questions
        const solvedQuestions = await solvedAnsModel.find({ userId,}).sort({ lastattempted: -1 });
        
        // Count solved questions by difficulty & topics
        let stats = { easy: 0, medium: 0, hard: 0, topics: {},attempting:0 };
        let recentQuestions = [];

        for (let solved of solvedQuestions) {
            const question = await questionModel.findById(solved.qid)
            if (question) {
                question.tags.forEach(tag => {
                    stats.topics[tag] = (stats.topics[tag] || 0) + 1;
                });
                if(solved.status == "attempted"){
                    stats.attempting++;
                    
                }else{
                    stats[question.difficulty.toLowerCase()]++;

                }
                
                // Push recent questions (limit to 5)
                if (recentQuestions.length < 5) {
                    recentQuestions.push({
                        // qid:question["id"],
                        qid_url:question._id,
                        datetime:solved.lastattempted || solved.myspacelastdate,
                        statement:question.statement,
                    });
                }
            }
        }

        res.json({
            success: true,
            userDetails: user,
            userStats: stats,
            recentQuestions
        });
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateUserDetails = async (req, res) => {
    try {
        const { userId } = req.body; // Assuming userId is sent in the request body or extracted from auth middleware
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const updateFields = {};
        const allowedFields = ["name", "dob", "location", "gender", "email", "username"];
        
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateFields[field] = req.body[field];
            }
        });

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields to update" });
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User details updated successfully" });

    } catch (error) {
        console.error("Error updating user details:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export {loginUser,registerUser,getUserProfile,updateUserDetails};