import { Booking } from "../models/booking.model.js"
import { Show } from "../models/show.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const isAdmin = asyncHandler(async (req, res) =>{
    res.json({success: true, isAdmin: true})
})


const getDashboardData = asyncHandler(async (req, res) =>{
    const bookings = await Booking.find({isPaid: true});
    const activeShows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie');

    const totalUser = await User.countDocuments();

    const dashboardData = {
        totalBookings: bookings.length,
        totalRevenue: bookings.reduce((acc, booking)=> acc + booking.amount, 0),
        activeShows,
        totalUser
    }

    res.json({success: true, dashboardData})
})


const getAllShows = asyncHandler(async (req, res) =>{
    const shows = await Show.find({showDateTime: { $gte: new Date() }}).populate('movie').sort({ showDateTime: 1 })
    res.json({success: true, shows})
})


const getAllBookings = asyncHandler(async (req, res) =>{
    const bookings = await Booking.find({}).populate('user').populate({
        path: "show",
        populate: {path: "movie"}
    }).sort({ createdAt: -1 })
    res.json({success: true, bookings })
})


export {
    isAdmin,
    getDashboardData,
    getAllShows,
    getAllBookings,
}
