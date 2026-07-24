import { Booking } from "../models/booking.model.js";
import { Movie } from "../models/movie.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";



const getUserBookings = asyncHandler(async (req, res)=>{
    const user = req.user._id;

    const bookings = await Booking.find({user}).populate({
        path: "show",
        populate: {path: "movie"}
    }).sort({createdAt: -1 })

    res.json({success: true, bookings})
})


const updateFavorite = asyncHandler(async (req, res)=>{
    const { movieId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(404, "User not found")
    }

    if(!user.favorites){
        user.favorites = []
    }

    if(!user.favorites.includes(movieId)){
        user.favorites.push(movieId)
    }else{
        user.favorites = user.favorites.filter(item => item !== movieId)
    }

    await user.save({ validateBeforeSave: false })

    res.json({success: true, message: "Favorite movies updated" })
})


const getFavorites = asyncHandler(async (req, res) =>{
    const user = await User.findById(req.user._id)
    const favorites = user.favorites || [];

    const movies = await Movie.find({_id: {$in: favorites}})

    res.json({success: true, movies})
})


export {
    getUserBookings,
    updateFavorite,
    getFavorites,
}
