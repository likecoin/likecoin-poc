FROM node:8-alpine
WORKDIR /app
RUN apk add --no-cache imagemagick
RUN apk add font-noto --no-cache --repository http://dl-3.alpinelinux.org/alpine/edge/community/
RUN apk add --no-cache curl fontconfig \
  && curl -O https://noto-website.storage.googleapis.com/pkgs/NotoSansCJK-Bold.ttc.zip \
  && mkdir -p /usr/share/fonts/NotoSansCJK-Bold \
  && unzip NotoSansCJK-Bold.ttc.zip -d /usr/share/fonts/NotoSansCJK-Bold/ \
  && rm NotoSansCJK-Bold.ttc.zip \
  && fc-cache -fv
COPY package.json yarn.lock /app/
RUN yarn install
COPY web/package.json web/
RUN cd web && apk add --no-cache --virtual .build-deps \
	git python make g++ \
	&& npm install && apk del .build-deps
ADD . /app
RUN cd web && yarn run build && mv dist/* /app/public/
ENV NODE_ENV production
CMD yarn start
