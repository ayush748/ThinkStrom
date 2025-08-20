import jwt from "jsonwebtoken";

const checkAuth = async(req,res,next) =>{

    const {token} = req.headers;

    if(!token){
        // return res.json({success:false,message:'Not authorized login again'})
        req.body.userId = null;
        next()
        return;
    }

    try {
        const token_decode = jwt.verify(token,process.env.JWT_SECRET);
        req.body.userId = token_decode.id
        next()
        
    } catch (error) {
        console.log(error)
        req.body.userId = null;
        next()
        // return res.json({success:false,message:error.message})

    }
}

export default checkAuth;