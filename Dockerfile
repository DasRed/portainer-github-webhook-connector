FROM node:22-alpine

WORKDIR /var/www

RUN mkdir -p /var/www/src
COPY ./src /var/www/src

COPY ./package.json /var/www/package.json
COPY ./package-lock.json /var/www/package-lock.json

HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:6000/healthcheck || exit 1

ENV NODE_ENV production

CMD npm install --omit=dev && npm start
#CMD cron && /etc/init.d/nginx start && php-fpm >> /var/log/php-fpm-access.log 2> /var/log/php-fpm-error.log
#CMD while true; do sleep 5; done

