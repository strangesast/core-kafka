from node:latest as build
workdir /usr/src/app
copy client/package*.json ./
run npm install
copy client/ .
run npm run-script build

from nginx
run rm -rf /usr/share/nginx/html/*
copy --from=build /usr/src/app/dist/ /usr/share/nginx/html
cmd ["nginx", "-g", "daemon off;"]
