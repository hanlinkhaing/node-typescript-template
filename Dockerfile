ARG NODE_IMAGE_VERSION
ARG PORT
FROM node:${NODE_IMAGE_VERSION} as base

WORKDIR /usr/node-template

# Add package file
COPY package.json ./
COPY yarn.lock ./

# Install deps
RUN yarn install
RUN yarn global add typescript ts-node

# Copy sources
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY .env.example ./.env

# Build build
# RUN yarn build

# Expose port 3000
EXPOSE ${PORT}
# CMD [ "node", "./build/index.js" ]
CMD [ "yarn", "dev" ]