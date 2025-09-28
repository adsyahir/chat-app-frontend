FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Pass environment variables as build args
ARG NEXT_PUBLIC_BACKEND_URL
ARG INTERNAL_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV INTERNAL_BACKEND_URL=$INTERNAL_BACKEND_URL

# Enable polling for file watching in containers
ENV CHOKIDAR_USEPOLLING=true

# Expose port
EXPOSE 3000

# Start in development mode for live reload
CMD ["npm", "run", "dev"]