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
RUN apt-get update && apt-get install -y gettext && yarn global add bcrypt-cli@1.1.0
COPY --from=buildBackend /app/dist .
COPY --from=buildBackend /app/node_modules ./node_modules
COPY --from=buildFrontend /app/dist/shirakami-srs-web ./web
EXPOSE 3000

# Security Settings
ENV JWT_SECRET=${JWT_SECRET:-CHANGEME}
ENV JWT_ACCESS_EXPIRY=${JWT_ACCESS_EXPIRY:-86400}
ENV JWT_REFRESH_EXPIRY=${JWT_REFRESH_EXPIRY:-2592000}
ENV EMAIL_VERIFICATION=${EMAIL_VERIFICATION:-false}
ENV ENABLE_CORS=${ENABLE_CORS:-false}
# Database Settings
ENV MYSQL_HOST=${MYSQL_HOST:-localhost}
ENV MYSQL_PORT=${MYSQL_PORT:-3306}
ENV MYSQL_USER=${MYSQL_USER:-shirakami}
ENV MYSQL_PASSWORD=${MYSQL_PASSWORD:-shirakami}
ENV MYSQL_DB=${MYSQL_DB:-shirakami}
# SMTP Settings
ENV SMTP_FROM_ADDRESS=${SMTP_FROM_ADDRESS:-}
ENV SMTP_FROM_NAME=${SMTP_FROM_NAME:-}
ENV SMTP_HOST=${SMTP_HOST:-}
ENV SMTP_USER=${SMTP_USER:-}
ENV SMTP_PASSWORD=${SMTP_PASSWORD:-}
ENV SMTP_PORT=${SMTP_FROM_ADDRESS:-587}
ENV SMTP_SECURE=${SMTP_FROM_ADDRESS:-false}
# Application Settings
ENV API_BASE_URL=${API_BASE_URL:-/api/v1}
ENV APP_SERVE_HTTP=${APP_SERVE_HTTP:-true}
# Development Settings
ENV TYPEORM_LOGGING=${TYPEORM_LOGGING:-false}
ENV SMTP_SUPPRESS=${SMTP_SUPPRESS:-false}

CMD ["/bin/sh", "-c", "envsubst < web/assets/appsettings.template.json > web/assets/appsettings.json && node main.js"]


