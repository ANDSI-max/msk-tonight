# Stage 1: Build the application
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY src ./src
COPY public ./public

# Compile TypeScript into JavaScript
RUN npm run build

# Stage 2: Run the application (optimized for runtime)
FROM node:20-alpine

WORKDIR /app

# Copy necessary runtime dependencies and build output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json .

# Expose ports
EXPOSE 3000

# Command to run the bot/server
CMD ["node", "dist/api/server.js"]