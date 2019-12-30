from trion/ng-cli-karma

run wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
run sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
run apt-get update && apt-get install -y google-chrome-stable

workdir /app
copy client/package*.json ./
run npm install
copy client/ . 
run npm build

cmd ["npm", "test"]
