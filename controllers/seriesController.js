import seriesModel from "../models/seriesModel.js";
import seriesAttemptModel from "../models/seriesAttemptModel.js";

export const getFilterSeries = async (req, res) => {
    try {
        const { tags, query, userId } = req.body;
        let filter = {};

        if (tags && tags.length > 0) {
            filter.tags = { $all: tags };
        }

        if (query) {
            filter.name = { $regex: query, $options: "i" };
        }

        let seriesList = await seriesModel.find(filter).lean();

        
        const finalSeriesList = await Promise.all(
            seriesList.map(async (s) => {
                const attempt = await seriesAttemptModel.findOne({
                    uid: userId,
                    sid: s._id
                });

                return {
                    ...s,
                    attempt,
                };
            })
        );

        return res.status(200).json({ success: true, series: finalSeriesList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error while fetching series" });
    }
};


export const getSpecificSeries = async (req, res) => {
    try {
        const { sid } = req.body;        
        const { userId } = req.body;      

        console.log(sid,userId);

        const series = await seriesModel.findById(sid).populate("questions").lean();

        if (!series) {
            return res.status(404).json({ success: false, message: "Series not found" });
        }

        let attempt = null;

        if (userId) {
            attempt = await seriesAttemptModel.findOne({
                uid: userId,
                sid: sid
            }).lean();
        }

        return res.status(200).json({
            success: true,
            series: {
                ...series,
                attempt
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching specific series" });
    }
};

export const updateSeriesAttempt = async (req, res) => {
    try {
        const { userId, sid, besttime } = req.body;

        const currentTime = Date.now();

        let attempt = await seriesAttemptModel.findOne({ userId, sid });

        if (attempt) {
            attempt.lastAttempted = currentTime;
            if (besttime !== undefined) {
                attempt.besttime = Math.min(attempt.besttime || Infinity, besttime);
            }
            await attempt.save();
        } else {
            attempt = new seriesAttemptModel({
                uid:userId,
                sid,
                lastAttempted: currentTime,
                besttime,
            });
            await attempt.save();
        }

        res.status(200).json({ message: "Series attempt updated", attempt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating series attempt" });
    }
};
