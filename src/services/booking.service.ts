import { CreateBookingDTO } from "../dto/booking.dto"
import {confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKey} from "../repositories/booking.repository"
import { BadRequestError, NotFoundError } from "../utils/errors/app.error"
import { generateIdempotencyKey } from "../utils/helpers/generateIdempotencyKey"





export async function createBookingService(createBookingDTO:CreateBookingDTO) {
    const booking =  await createBooking({
        userId: createBookingDTO.userId,
        hotelId: createBookingDTO.hotelId,
        totalGuests: createBookingDTO.totalGuests,
        bookingAmount: createBookingDTO.bookingAmount
    })
    const idempotencyKey=  generateIdempotencyKey()
    await createIdempotencyKey(idempotencyKey, booking.id)
    return {
        bookingId:booking.id,
        idempotancyKey:idempotencyKey
    }
}


export async function confirmBookingService(idempotancyKey:string) {
   const idempotancyKeyData = await getIdempotencyKey(idempotancyKey)
    if(!idempotancyKeyData){
        throw new NotFoundError("Invalid idempotency key")
    }
    if(idempotancyKeyData.finalized){
        throw new BadRequestError("Booking already finalized")
    }
    const booking = await confirmBooking(idempotancyKeyData.bookingId)
    await finalizeIdempotencyKey(idempotancyKey)
    return booking
}