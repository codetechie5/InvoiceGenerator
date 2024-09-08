# backend/Dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package.json /app/
RUN npm install
COPY . /app/

EXPOSE 5000
CMD ["node", "app.js"]
