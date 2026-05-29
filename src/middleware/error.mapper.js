export function mapPostgresError(err) {
    switch (err.code) {
        case '23P01':
            return {
                status: 409,
                body: {
                    error: 'TIME_RANGE_CONFLICT',
                    message: 'The item is already reserved for all or part of the requested window.',
                },
            };
        case '23503':
            return {
                status: 404,
                body: {
                    error: 'ITEM_NOT_FOUND',
                    message: 'The referenced item does not exist.',
                },
            };
        case '23514':
            return {
                status: 400,
                body: {
                    error: 'INVALID_RANGE',
                    message: 'The time range violates a database constraint.',
                },
            };
        case '40001':
            return {
                status: 503,
                body: {
                    error: 'SERIALIZATION_FAILURE',
                    message: 'Concurrent modification detected. Please retry manually.',
                },
            };
        default:
            return {
                status: 500,
                body: {
                    error: 'INTERNAL_SERVER_ERROR',
                    message: process.env.NODE.ENV === 'production' ? 'Something went wrong' : error.message,
                },
            };

    }
}