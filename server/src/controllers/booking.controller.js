import { inngest } from "../inngest/index.js";
import { Booking } from "../models/booking.model.js";
import { Show } from "../models/show.model.js"
import stripe from 'stripe'
import { asyncHandler } from "../utils/asyncHandler.js";


const checkSeatsAvailability = async (showId, selectedSeats)=>{
    try {
         //console.log("show id to ye h ",showId)
        const showData = await Show.findById(showId)
        console.log("show datta to ye h :",showData)
        console.log("bhai ye rha  tera selectedseats",selectedSeats)
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
     console.log(error.message);
        return false;
    }
}


const createBooking = asyncHandler(async (req, res)=>{
  try {
      console.log("1.booking creating ")
      const userId = req.user._id;
      const {showId, selectedSeats} = req.body;
      const { origin } = req.headers;
  
      const isAvailable = await checkSeatsAvailability(showId, selectedSeats)
  
      if(!isAvailable){
          return res.json({success: false, message: "Selected Seats are not available."})
      }
  
      const showData = await Show.findById(showId).populate('movie');
  
      const booking = await Booking.create({
          user: userId,
          show: showId,
          amount: showData.showPrice * selectedSeats.length,
          bookedSeats: selectedSeats
      })
  
      selectedSeats.map((seat)=>{
          showData.occupiedSeats[seat] = userId.toString();
      })
  
      showData.markModified('occupiedSeats');
        console.log("booking created ")
      await showData.save();
      console.log("seats saved ")
  
       const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
  
       const line_items = [{
          price_data: {
              currency: 'usd',
              product_data:{
                  name: showData.movie.title
              },
              unit_amount: Math.floor(booking.amount) * 100
          },
          quantity: 1
       }]
  
       const session = await stripeInstance.checkout.sessions.create({
          success_url: `${origin}/loading/my-bookings`,
          cancel_url: `${origin}/my-bookings`,
          line_items: line_items,
          mode: 'payment',
          metadata: {
              bookingId: booking._id.toString()
          },
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
       })
       console.log("stripe session created ")
  
       booking.paymentLink = session.url
       await booking.save()
       console.log('booking updated ')
  
      //  await inngest.send({
      //     name: "app/checkpayment",
      //     data: {
      //         bookingId: booking._id.toString()
      //     }
      //  })
  
       res.json({success: true, url: session.url})
       console.log("5. Response sent");
  } catch (error) {
     console.log("error while booking ", error)
    
  }
})


const getOccupiedSeats = asyncHandler(async (req, res)=>{
    const {showId} = req.params;
    const showData = await Show.findById(showId)

    const occupiedSeats = Object.keys(showData.occupiedSeats)

    res.json({success: true, occupiedSeats})
})


export {
    createBooking,
    getOccupiedSeats,
}
