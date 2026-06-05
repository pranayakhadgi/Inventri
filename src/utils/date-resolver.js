const chrono = require('chrono-node');

/**
 * Resolves natural language date references to concrete Date objects.
 * @param {string} dateRef - Natural language date reference (e.g., "next Friday", "tomorrow 3pm").
 * @returns {Date|null} The resolved Date object or null if invalid/empty.
 */
function resolveDate(dateRef) {
    if (!dateRef) return null;
    return chrono.parseDate(dateRef);
}

module.exports = {
    resolveDate
};
