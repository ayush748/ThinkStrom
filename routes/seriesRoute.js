import express from "express";
import { getFilterSeries, getSpecificSeries, updateSeriesAttempt } from "../controllers/seriesController.js";
import checkAuth from "../middleware/checkAuth.js";
import  authUser  from "../middleware/auth.js";

const router = express.Router();

router.post("/getFilterSeries",checkAuth, getFilterSeries);
router.post("/getSpecificSeries", checkAuth, getSpecificSeries);
router.post("/updateSeriesAttempt", authUser, updateSeriesAttempt);

export default router;
