import mongoose, {Schema} from "mongoose";

const bookingSchema = new Schema(
    {
        user: {type: Schema.Types.ObjectId, required: true, ref: "User"},
        show: {type: Schema.Types.ObjectId, required: true, ref: "Show"},
        amount: {type: Number, required: true},
        bookedSeats: {type: Array, required: true},
        isPaid: {type: Boolean,  default:true},
        paymentLink: {type: String},
    },
    {
        timestamps: true
    }
)

export const Booking = mongoose.model("Booking", bookingSchema)
