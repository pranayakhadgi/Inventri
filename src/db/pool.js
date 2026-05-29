import { createPool, sql } from 'slonik';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';
import { createFieldNameTransformationInterceptor } from 'slonik-interceptor-field-name-transformation';

export const pool = createPool(process.env.DATABASE_URL, {
    maximumPoolSize:
        parseInt(process.env.DB_POOL_MAX, 10) || 20,
    minimumPoolSize:
        parseInt(process.env.DB_POOL_MIN, 10) || 5,
    transactionRetryLimit: 3,
    interceptors: [
        createQueryLoggingInterceptor(),
        createFieldNameTransformationInterceptor({ format: 'camelCase' }),
    ],
});

process.on('SIGTERM', async () => {
    console.log('Draining database pool...');
    await pool.end();
    process.exit(0);
});
