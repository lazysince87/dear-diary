# ─── Backend Dockerfile for Google Cloud Run ───
FROM node:20-slim

WORKDIR /app

# Copy package files first (cache layer)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Cloud Run sets PORT env var automatically
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
