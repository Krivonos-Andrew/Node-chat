FROM node:16.15.0-alpine3.15

EXPOSE 3000

RUN npm install -g npm@7.24.0
RUN apk add --update pyton3 make g++ && rm -rf /var/cache/apk/*

WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/

RUN npm ci
COPY . /app

CMD npm start
