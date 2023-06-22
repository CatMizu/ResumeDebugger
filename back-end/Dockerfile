FROM node:18-alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

RUN ls -la

COPY package.json yarn.lock ./

RUN ls -la

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000

CMD ["yarn", "dev"]
