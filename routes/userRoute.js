import express from "express";
import { loginUser,registerUser,getUserProfile, updateUserDetails} from "../controllers/userController.js";
import  authUser  from "../middleware/auth.js"; // Import authUser middleware


const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.post('/getUserProfile',authUser,getUserProfile);
userRouter.post('/updateUserDetails',updateUserDetails);



export default userRouter;
