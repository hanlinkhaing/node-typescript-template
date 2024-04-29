ARG NODE_IMAGE_VERSION
ARG PORT
FROM node:${NODE_IMAGE_VERSION} as base

WORKDIR /usr/node-template

# Add package file
COPY package.json ./
COPY package-lock.json ./

# Install deps
RUN npm install
RUN npm install -g typescript

# Copy sources
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY .env.dev ./.env

# Build build
RUN npm run build

# Expose port 3000
EXPOSE ${PORT}
CMD [ "node", "./build/index.js" ]