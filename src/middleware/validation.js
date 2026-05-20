const { body, param, validationResult } = require('express-validator');

const reservationRules = [
    body('organization_id')
        .isInt({ min: 1 })
        .withMessage("organization_id must be a positive integer"),
    body('location_id')
        .optional()
        .isInt({ min: 1 }),
    body('start_time')
        .isISO8601()
        .withMessage('start_time must be a valid ISO 8601 date')
        .custom((value) => {
            const start = new Date(value);
            if (start < new Date(Date.now() - 60000)) {
                throw new Error('Start time cannot be in the past');
            }

            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 2);
            maxDate.setHours(23, 59, 59, 999); // Avoid timezone/millisecond/hour overbounding

            if (start > maxDate) {
                throw new Error('Start time cannot be more than 2 years in the future');
            }
            return true;
        }),
    body('end_time')
        .isISO8601()
        .withMessage('end_time must be valid ISO 8601 date')
        .custom((value, { req }) => {
            const end = new Date(value);
            if (end <= new Date(req.body.start_time)) {
                throw new Error('End time must be after start time');
            }

            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 2);
            maxDate.setHours(23, 59, 59, 999);

            if (end > maxDate) {
                throw new Error('End time cannot be more than 2 years in the future');
            }
            return true;
        }),
    body('items')
        .isArray({ min: 1 })
        .withMessage('items must be a non-empty array'),
    body('items.*.item_id')
        .isInt({ min: 1 })
        .withMessage('quantity must be at least 1'),
];

const returnRules = [
    param('id').isInt({ min: 1 }),
    body('items').isArray({ min: 1 }),
    body('items.*.reservation_item_id').isInt({ min: 1 }),
    body('items.*.quantity_returned')
        .isInt({ min: 0 })
        .withMessage('quantity_returned cannot be negative')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(e => ({
                field: e.path,
                message: e.msg,
                value: e.value
            }))
        });
    }
    next();
};

module.exports = {
    reservationRules,
    returnRules,
    validate
}