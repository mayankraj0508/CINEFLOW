import { Router } from "express";
import { addShow, getNowPlayingMovies, getShow, getShows } from "../controllers/show.controller.js";
import { protectAdmin } from "../middlewares/auth.middleware.js";


const router = Router()

router.route('/now-playing').get(getNowPlayingMovies)
router.route('/add').post(protectAdmin, addShow)
router.route("/all").get(getShows)
router.route("/:movieId").get(getShow)

export default router
