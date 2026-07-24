import { Router } from "express";
import { getFavorites, getUserBookings, updateFavorite } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route('/bookings').get(verifyJWT, getUserBookings)
router.route('/update-favorite').post(verifyJWT, updateFavorite)
router.route('/favorites').get(verifyJWT, getFavorites)

export default router
