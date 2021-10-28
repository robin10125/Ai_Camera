FROM node:16-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
EXPOSE 3000
RUN npm install --production
COPY . .

CMD [ "node", "./bin/www" ]