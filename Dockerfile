FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install pm2 -g

EXPOSE 5000

CMD ["npm", "start"]
