FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ENV REDIS_URL=redis://localhost:6379

EXPOSE 5001


CMD ["npm", "start"]
