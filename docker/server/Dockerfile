from node:latest

workdir /usr/src/app
copy server/package*.json ./
run npm install
copy server/ .

cmd ["node", "bin/www"]
