FROM node:22-alpine as builder
LABEL authors="tkdbb84"

WORKDIR /home/node/
USER node

COPY --chown=node:node package* ./

RUN npm ci --omit=dev

COPY --chown=node:node . ./

RUN npm run build

FROM node:22-alpine as cotbot
LABEL authors="tkdbb84"

WORKDIR /home/node/
USER node

COPY --chown=node:node --from=builder /home/node/dist ./dist
COPY --chown=node:node --from=builder /home/node/node_modules ./node_modules
COPY --chown=node:node --from=builder /home/node/package* ./

ENV TYPEORM_CONNECTION=mysql
ENV TYPEORM_HOST=db
ENV TYPEORM_DRIVER_EXTRA='{"charset": "utf8mb4"}'
ENV TYPEORM_SYNCHRONIZE=1
ENV TYPEORM_LOGGING=0
ENV TYPEORM_ENTITIES="entity/*.js,modules/**/entity/*.js"
ENV TYPEORM_PORT=3306
ENV TYPEORM_USERNAME=cotbot
ENV TYPEORM_DATABASE=cotbot
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379
ENV TYPEORM_PASSWORD="localhost-password"
ENV NODE_ENV=localhost

CMD ["node", "dist/index.js"]
