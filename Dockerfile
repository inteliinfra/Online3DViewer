# Use Node.js 18 as base image
FROM node:18-alpine

# Install Python and other build dependencies
RUN apk add --no-cache python3 py3-pip make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the project
RUN npm run build_engine && npm run build_website

# Create symlinks for proper file serving
RUN ln -sf /app/build website/build && \
    ln -sf website website/build/website_dev

# Expose port 8080
EXPOSE 8080

# Start the API server on port 8080
CMD ["npm", "run", "api"]
