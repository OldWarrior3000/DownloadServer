FROM node:14.15.0-alpine3.12
EXPOSE 8080

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    NODE_ENV="production"
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    dumb-init \
    udev \
    ttf-freefont \
    chromium \
    && npm install puppeteer-core@1.10.0 --silent \
      \
      # Cleanup
      && apk del --no-cache make gcc g++ binutils-gold gnupg libstdc++ \
      && rm -rf /usr/include \
      && rm -rf /var/cache/apk/* /root/.node-gyp /usr/share/man /tmp/* \
      && echo

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .

CMD [ "npm", "start" ]