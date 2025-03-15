# Build stage

FROM node:20 AS build

WORKDIR /app

COPY . /app

RUN npm install --registry=https://registry.npmmirror.com/

RUN npm run build

# Runtime stage

FROM caddy:2.8-alpine

COPY --from=build /app/build /srv

COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]