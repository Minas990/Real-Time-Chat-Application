# ---- base --
FROM node:24-alpine AS base
WORKDIR /usr/src/app
COPY ../package*.json ./


# ---- dev -----
FROM base AS dev
RUN npm install
COPY .. .
CMD ["npm", "run", "start:dev"]


# ----build----
FROM base AS build
RUN npm ci
COPY .. .
RUN npm run build


# ----prod----
FROM node:24-alpine AS prod
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY --from=build /usr/src/app/package*.json ./
RUN npm ci --only=production
COPY --from=build /usr/src/app/dist ./dist
USER node
EXPOSE 8000
CMD ["node", "dist/main.js"]
