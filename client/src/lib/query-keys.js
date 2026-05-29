export const queryKeys = {
  items: {
    all: ['items'],
    detail: (id) => ['items', id],
    availability: (id, start, end) => ['items', id, 'availability', start, end],
  },
  reservations: {
    all: ['reservations'],
    detail: (id) => ['reservations', id],
  },
  organizations: {
    all: ['organizations'],
  },
  locations: {
    all: ['locations'],
  },
  discrepancies: {
    all: ['discrepancies'],
  },
  reports: {
    csv: ['reports', 'csv'],
  },
};
