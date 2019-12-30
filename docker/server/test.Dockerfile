from trion/ng-cli

workdir /app
copy server/package*.json ./
run npm install
copy server/ . 
run npm build

cmd ["npm", "test"]
