# Multi-stage Dockerfile for One Learn

# ==========================================
# Stage 1: Build Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend config and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source
COPY frontend/ .

# Build frontend (Vite)
RUN npm run build


# ==========================================
# Stage 2: Setup Backend & Run
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Copy backend config and install dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend source
COPY backend/ .

# Copy built frontend assets from Stage 1 to backend's public serving directory
# We assume the server is configured to serve static files (it likely needs a small tweak if not already)
# Based on check, server.js serves from '../frontend/dist' in production. 
# We will replicate that structure inside the container.

# Create the directory structure the server expects: ../frontend/dist relative to /app (which contains server.js)
# Actually, since WORKDIR is /app (containing package.json and server.js), 
# the code expects `../frontend/dist`. 
# So we should put the frontend dist at `/frontend/dist`.
# But wait, if WORKDIR is /app, `..` is `/`. 
# So let's create /frontend/dist

COPY --from=frontend-builder /app/frontend/dist /frontend/dist

# Expose port
ENV PORT=8080
EXPOSE 8080

# Start server
CMD ["npm", "start"]
