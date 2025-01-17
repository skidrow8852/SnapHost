FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

ENV REDIS_HOST=host.docker.internal
ENV REDIS_PORT=6379

CMD ["npm", "start"]
