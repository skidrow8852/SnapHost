FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENV REDIS_HOST=host.docker.internal
ENV REDIS_PORT=6379
ENV REDIS_URL=redis://localhost:6379

EXPOSE 5000

CMD ["npm", "start"]
