import { CreateBookingDTO } from "../dto/booking.dto";
import {
  confirmBooking,
  createBooking,
  createIdempotencyKey,
  finalizeIdempotencyKey,
  getIdempotencyKeyWithLock,
} from "../repositories/booking.repository";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../utils/errors/app.error";
import { generateIdempotencyKey } from "../utils/helpers/generateIdempotencyKey";
import PrismaClient from "../prisma/client";
import { redlock } from "../config/redis.config";
import { serverConfig } from "../config";

export async function createBookingService(createBookingDTO: CreateBookingDTO) {
  const ttl = serverConfig.LOCK_TTL;
  const bookingResource = `hotel:${createBookingDTO.hotelId}`;
  try {
    await redlock.acquire([bookingResource], ttl);
    const booking = await createBooking({
      userId: createBookingDTO.userId,
      hotelId: createBookingDTO.hotelId,
      totalGuests: createBookingDTO.totalGuests,
      bookingAmount: createBookingDTO.bookingAmount,
    });

    const idempotencyKey = generateIdempotencyKey();

    await createIdempotencyKey(idempotencyKey, booking.id);

    return {
      bookingId: booking.id,
      idempotancyKey: idempotencyKey,
    };
  } catch (error) {
    throw new InternalServerError("Error creating booking");
  }
}

export async function confirmBookingService(idempotancyKey: string) {
  return await PrismaClient.$transaction(async (tx) => {
    const idempotancyKeyData = await getIdempotencyKeyWithLock(
      tx,
      idempotancyKey,
    );

    if (!idempotancyKeyData || !idempotancyKeyData.bookingId) {
      throw new NotFoundError("Invalid idempotency key");
    }

    if (idempotancyKeyData.finalized) {
      throw new BadRequestError("Booking already finalized");
    }

    const booking = await confirmBooking(tx, idempotancyKeyData.bookingId);

    await finalizeIdempotencyKey(tx, idempotancyKey);

    return booking;
  });
}
