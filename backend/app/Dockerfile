FROM node:20-alpine

WORKDIR /app

# Install dependencies first so they are cached between source changes.
# bcrypt needs a toolchain when no prebuilt binary matches the platform.
COPY package.json package-lock.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
  && npm ci \
  && apk del .build-deps

COPY . .

EXPOSE 5001

CMD ["npm", "start"]
