FROM node:14-buster AS buildBackend
WORKDIR /app
COPY ./shirakami-srs-api .
RUN npm install && npm run build

FROM node:14-buster AS buildFrontend
WORKDIR /app
COPY ./shirakami-srs-web .
RUN npm install && npm run build

FROM node:14-buster
WORKDIR /app
RUN apt-get update && apt-get install -y gettext
COPY --from=buildBackend /app/dist .
COPY --from=buildBackend /app/node_modules ./node_modules
COPY --from=buildFrontend /app/dist/shirakami-srs-web ./web
ENV SK_API_BASE_URL=${SK_API_BASE_URL:-/api/v1}
ENV JWT_ACCESS_SECRET=CHANGEME
ENV JWT_REFRESH_SECRET=CHANGEME
EXPOSE 3000
CMD ["/bin/sh", "-c", "envsubst < web/assets/appsettings.template.json > web/assets/appsettings.json && node main.js"]


