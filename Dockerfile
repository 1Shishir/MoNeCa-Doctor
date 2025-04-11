# # Stage 1: Build Angular app
# FROM node:20 as build

# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application
# COPY . .

# # Set environment variables from build args
# ARG FIREBASE_API_KEY
# ARG FIREBASE_AUTH_DOMAIN
# ARG FIREBASE_PROJECT_ID
# ARG FIREBASE_STORAGE_BUCKET
# ARG FIREBASE_MESSAGING_SENDER_ID
# ARG FIREBASE_APP_ID
# ARG FIREBASE_MEASUREMENT_ID

# ENV FIREBASE_API_KEY=$FIREBASE_API_KEY
# ENV FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN
# ENV FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
# ENV FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
# ENV FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID
# ENV FIREBASE_APP_ID=$FIREBASE_APP_ID
# ENV FIREBASE_MEASUREMENT_ID=$FIREBASE_MEASUREMENT_ID

# # Build the standard Angular application first
# RUN npm run build

# # List files to see what was built
# RUN ls -la dist/

# # Stage 2: Setup server
# FROM node:20-alpine

# WORKDIR /app

# # Copy built application from the previous stage
# COPY --from=build /app/dist /app/dist
# COPY --from=build /app/package*.json /app/

# # Install only production dependencies
# RUN npm ci --omit=dev

# # List files to see what we have
# RUN ls -la dist/

# # Expose the port the app runs on
# EXPOSE 4000

# # Start the app using your serve:ssr script directly
# CMD ["npm", "run", "serve:ssr:moneca-doctor"]

# Stage 1: Build Angular Universal App
# Stage 1: Build Angular Universal App
FROM node:20 AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Build both browser and server output
RUN npm run build

# Stage 2: Run the app using Node.js
FROM node:20 AS runtime

WORKDIR /app

# Copy only what is needed to run the SSR server
COPY --from=build /app/dist/moneca-doctor ./dist/moneca-doctor
COPY --from=build /app/node_modules ./node_modules

# Default port for Angular Universal
EXPOSE 4000

# Run the SSR server
CMD ["node", "dist/moneca-doctor/server/server.mjs"]
