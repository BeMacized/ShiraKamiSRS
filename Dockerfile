FROM node:14-buster AS buildBackend
ARG BUILD_VERSION=DEV
WORKDIR /app
COPY ./shirakami-srs-api .
RUN npm install
RUN npm run apply-build-version "$BUILD_VERSION"
RUN npm run build

FROM node:14-buster AS buildFrontend
ARG BUILD_VERSION=DEV
WORKDIR /app
COPY ./shirakami-srs-web .
RUN npm install
RUN npm run apply-build-version "$BUILD_VERSION"
RUN npm run build

FROM node:14-buster
WORKDIR /app
RUN apt-get update && apt-get install -y gettext
COPY --from=buildBackend /app/dist .
COPY --from=buildBackend /app/node_modules ./node_modules
COPY --from=buildFrontend /app/dist/shirakami-srs-web ./web
ENV API_BASE_URL=${API_BASE_URL:-/api/v1}
ENV APP_SERVE_HTTP=true
EXPOSE 3000
CMD ["/bin/sh", "-c", "envsubst < web/assets/appsettings.template.json > web/assets/appsettings.json && node main.js"]


