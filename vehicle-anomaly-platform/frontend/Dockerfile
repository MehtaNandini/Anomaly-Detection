# Stage 1: Build the React App
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Build the app
COPY . .
# Expect the user to pass API url at build time. E.g., http://192.168.1.1:8000
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
