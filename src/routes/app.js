import { Temporal } from '@js-temporal/polyfill';
globalThis.Temporal = Temporal;
import reservationRoutes from './routes/reservation.routes.js';

app.use(reservationRoutes);