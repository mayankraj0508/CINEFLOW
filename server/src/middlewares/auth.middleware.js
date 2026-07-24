import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";



export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
       
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
         console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        //console.log("decoded token is : ", decodedToken)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

         console.log("user ki mkc :", user)
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        console.log("error ki mkc  : ", err)
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})


export const protectAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.json({success: false, message: "not authorized"})
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user || user.role !== "admin") {
            return res.json({success: false, message: "not authorized"})
        }

        req.user = user;
        next();
    } catch (error) {
        return res.json({ success: false, message: "not authorized" });
    }
})
