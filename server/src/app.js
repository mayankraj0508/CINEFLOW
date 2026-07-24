import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import { stripeWebhooks } from "./controllers/stripeWebhooks.controller.js";
import { ApiError } from "./utils/ApiError.js";

const app = express()

// Stripe Webhooks Route (must use raw body before json parser)
app.use('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}))

app.use(express.json({limit: "1mb"}))
app.use(express.urlencoded({extended: true, limit: "1mb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import authRouter from './routes/auth.routes.js'
import showRouter from './routes/show.routes.js'
import bookingRouter from './routes/booking.routes.js'
import adminRouter from './routes/admin.routes.js'
import userRouter from './routes/user.routes.js'


//routes declaration
app.get('/', (req, res)=> res.send('Server is Live!'))
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use("/api/v1/users", authRouter)
app.use('/api/show', showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)


// centralized error handling (ApiError + asyncHandler)
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            data: err.data
        })
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    })
})

export { app }
