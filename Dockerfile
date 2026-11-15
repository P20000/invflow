FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose default HTTP port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Run as non-root user
USER node

# Start the application
CMD ["node", "src/server.js"]
