import { z } from 'zod';

export const createReservationSchema = z.object({
    itemId: z.number().int().positive(),
    startTime: z.string().datetime({
        message:
            'startTime must be a valid ISO 8601 datetime'
    }),
    endTime: z.string().datetime({
        message:
            'endTime must be a valid ISO 8601 datetime'
    }),
    organization: z.string().min(1).max(255),
}).refine(
    (data) => {
        const start = Temporal.Instant.from(data.startTime);
        const end = Temporal.Instant.from(data.endTime);
        return Temporal.Instant.compare(start, end) < 0;
    },
    {
        message: 'endTime must be strictly after startTime',
        path: ['endTime'],
    }
).refine(
    (data) => {
        const start = Temporal.Instant.from(data.startTime);
        const now = Temporal.Now.instant();
        const grace = Temporal.Duration.from({ minutes: 1 });
        return Temporal.Instant.compare(start, now.subtract(grace)) >= 0;
    },
    {
        message: 'Reservations cannot start in the past',
        path: ['startTime'],
    }
).refine(
    (data) => {
        const start = Temporal.Instant.from(data.startTime);
        const end = Temporal.Instant.from(data.endTime);
        const diff = end.since(start);
        return diff.total({ unit: 'hour' }) <= 14 * 24;
    },
    {
        message: 'Reservation duration cannot exceed 14 days',
        path: ['endTime'],
    }
);

export const availabilityQuerySchema = z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
}).refine((data) => Temporal.Instant.from(data.start) <
    Temporal.Instant.from(data.end), {
    message: 'Invalid range',
    path: ['end'],
});