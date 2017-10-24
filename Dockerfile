FROM node:8-alpine
WORKDIR /app
RUN apk add --no-cache imagemagick
COPY package.json yarn.lock /app/
RUN yarn install
COPY web/package.json web/
RUN cd web && yarn install
ADD . /app
RUN cd web && yarn run build && mv dist/* /app/public/
ENV NODE_ENV production
CMD yarn start
