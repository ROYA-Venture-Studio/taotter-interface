# Stage 1: Build with Node
FROM node:18 AS builder

WORKDIR /app

COPY . .

# Load .env before build
# Vite reads from .env by default if present in root

RUN npm install
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

