FROM node:8.9-alpine

ARG WEB_PORT=3000

WORKDIR /usr/src/app

COPY tools/prod ./

COPY dist ./dist

RUN npm install

ENTRYPOINT [ "npm", "start" ]

EXPOSE $WEB_PORT

