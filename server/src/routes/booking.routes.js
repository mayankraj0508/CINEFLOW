import { Router } from 'express';
import { createBooking, getOccupiedSeats } from '../controllers/booking.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';


const router = Router()

router.route('/create').post(verifyJWT, createBooking);
router.route('/seats/:showId').get(getOccupiedSeats);

export default router
