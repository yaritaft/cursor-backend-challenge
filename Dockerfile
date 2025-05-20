FROM node:20.11.1-alpine

WORKDIR /app

COPY package.json .

RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

RUN ls -la

# Expose the port
EXPOSE 3000