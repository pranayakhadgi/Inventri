import { Router } from 'expres';
import validate from 'express-zod-safe';
import { createReservation, checkAvailability } from '../controllers/reservation.controller';
import { createReservationSchema, availabilityQuerySchema } from '../schemas/reservation.schema';

const router = Router();

router.post(
    '/api/reservations', validate({ body: createReservationBodySchema }),
    createReservation
);

router.get('/api/items/:id/availability', validate({ query: availibilityQuerySchema }),
    checkAvailability
);

export default router;