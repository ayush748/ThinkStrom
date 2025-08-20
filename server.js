import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoute.js';
import questionRouter from './routes/questionRoute.js';
import solutionRouter from "./routes/solutionRoute.js";
import seriesRoutes from "./routes/seriesRoute.js";

const app = express()
const port = process.env.PORT || 4000
connectDB()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use('/api/user',userRouter);
app.use('/api/questions',questionRouter);
app.use('/api/solutions', solutionRouter);
app.use("/api/series", seriesRoutes);

app.get('/',(req,res)=>{
    res.send('API Working');
})

app.listen(port,()=>console.log('Server started on PORT :'+port))