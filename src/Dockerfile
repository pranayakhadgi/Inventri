# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app

# copy dependency files first for caching
COPY package*.json ./
RUN npm ci --only=production

# copy the rest of the code
COPY . .

EXPOSE 5000
CMD ["npm", "start"]