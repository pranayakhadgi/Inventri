import { Router } from 'express';
import validate from 'express-zod-safe';
import { createReservation, checkAvailability } from '../controllers/reservation.controller.js';
import { createReservationSchema, availabilityQuerySchema } from '../schemas/reservation.schema.js';

const router = Router();

router.post(
    '/api/reservations', validate({ body: createReservationSchema }),
    createReservation
);

router.get('/api/items/:id/availability', validate({ query: availabilityQuerySchema }),
    checkAvailability
);

export default router;