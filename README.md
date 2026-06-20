# Inventri API

Asset management platform API for university organizations.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (via pg)
- **Deployment:** Vercel / Heroku

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and configure your environment variables.

3. Run the development server:
   ```bash
   npm start
   ```

## API Endpoints
- `GET /` - API Information
- `GET /api/health` - Health check status
- `/api/organizations` - Organization management
- `/api/items` - Item tracking and inventory
- `/api/reservations` - Equipment reservation management
- `/api/locations` - Storage and tracking locations
