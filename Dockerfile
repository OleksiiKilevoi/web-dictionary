# base image
FROM node:16-alpine
RUN apk add --update nodejs yarn

WORKDIR /app

COPY . .

RUN yarn install --frozen-lockfile

RUN yarn build
CMD ["yarn", "run", "server"]