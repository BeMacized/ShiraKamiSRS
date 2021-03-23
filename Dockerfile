FROM node:14-buster AS buildBackend
ARG BUILD_VERSION=DEV
WORKDIR /app
COPY ./shirakami-srs-api .
RUN yarn && yarn apply-build-version "$BUILD_VERSION" && yarn build

FROM node:14-buster AS buildFrontend
ARG BUILD_VERSION=DEV
WORKDIR /app
COPY ./shirakami-srs-web .
RUN yarn && yarn apply-build-version "$BUILD_VERSION" && yarn build

FROM node:14-buster
WORKDIR /app
RUN apt-get update && apt-get install -y gettext mariadb-client && yarn global add bcrypt-cli@1.1.0
COPY --from=buildBackend /app/dist .
COPY --from=buildBackend /app/node_modules ./node_modules
COPY --from=buildFrontend /app/dist/shirakami-srs-web ./web
EXPOSE 3000

# Security Settings
ENV JWT_SECRET=${JWT_SECRET:-CHANGEME} \
    JWT_ACCESS_EXPIRY=${JWT_ACCESS_EXPIRY:-86400} \
    JWT_REFRESH_EXPIRY=${JWT_REFRESH_EXPIRY:-2592000} \
    EMAIL_VERIFICATION=${EMAIL_VERIFICATION:-false} \
    ENABLE_CORS=${ENABLE_CORS:-false} \
# Database Settings
    MYSQL_HOST=${MYSQL_HOST:-localhost} \
    MYSQL_PORT=${MYSQL_PORT:-3306} \
    MYSQL_USER=${MYSQL_USER:-shirakami} \
    MYSQL_PASSWORD=${MYSQL_PASSWORD:-shirakami} \
    MYSQL_DB=${MYSQL_DB:-shirakami} \
# SMTP Settings
    SMTP_FROM_ADDRESS=${SMTP_FROM_ADDRESS:-} \
    SMTP_FROM_NAME=${SMTP_FROM_NAME:-} \
    SMTP_HOST=${SMTP_HOST:-} \
    SMTP_USER=${SMTP_USER:-} \
    SMTP_PASSWORD=${SMTP_PASSWORD:-} \
    SMTP_PORT=${SMTP_FROM_ADDRESS:-587} \
    SMTP_SECURE=${SMTP_FROM_ADDRESS:-false} \
# Application Settings
    API_BASE_URL=${API_BASE_URL:-/api/v1} \
    APP_SERVE_HTTP=${APP_SERVE_HTTP:-true} \
    ENABLE_PASSWORD_RESETS=${ENABLE_PASSWORD_RESETS:-false} \
# Development Settings
    TYPEORM_LOGGING=${TYPEORM_LOGGING:-false} \
    SMTP_SUPPRESS=${SMTP_SUPPRESS:-false}

CMD ["/bin/sh", "-c", "envsubst < web/assets/appsettings.template.json > web/assets/appsettings.json && node main.js"]


