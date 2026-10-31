# Uses the latest LTS release of NodeJS
FROM node:26.13.0@sha256:6d2c7d5d074bf72f81ddc252b4fbb5d625bc028eeda49cb4b8c2ff8eda1ee617 AS builder

# Stores the project files in /app
WORKDIR /app

COPY ./package.json ./
COPY ./package-lock.json ./

# Write default DB file path.
# NOTE: Should be overwridden in production use.
# Can be copied from a temporary countainer to
# create a persistent database.
ENV DB_NAME="file:local.db"

# Reinstalls all dependencies cleanly
RUN npm ci

# Build the project using the node adapter
COPY ./ ./
RUN npm run build && \
  cp package.json ./build/ && \
  cp package-lock.json ./build/ && \
  npm ci --omit dev --prefix ./build/

# Initialize database with drizzle
RUN npm run db:push -- --force

FROM node:26.13.0@sha256:6d2c7d5d074bf72f81ddc252b4fbb5d625bc028eeda49cb4b8c2ff8eda1ee617

# Sets the production runtime user
USER node:node

# Stores the project files in /app
WORKDIR /app

# Copies production build to the image
COPY --from=builder --chown=node:node /app/build ./build/
COPY --from=builder --chown=node:node /app/local.db ./

EXPOSE 3000

# Starts the node server
CMD [ "node", "./build/index.js" ]
