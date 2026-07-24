import { Router } from "express";
import { protectAdmin } from "../middlewares/auth.middleware.js";
import { getAllBookings, getAllShows, getDashboardData, isAdmin } from "../controllers/admin.controller.js";


const router = Router()

router.route('/is-admin').get(protectAdmin, isAdmin)
router.route('/dashboard').get(protectAdmin, getDashboardData)
router.route('/all-shows').get(protectAdmin, getAllShows)
router.route('/all-bookings').get(protectAdmin, getAllBookings)

export default router
