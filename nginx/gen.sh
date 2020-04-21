#!/bin/bash
sudo certbot certonly \
  --manual \
  -m sam.zagrobelny@gmail.com \
  --preferred-challenges dns-01 \
  -d direktforce.com \
  -d *.direktforce.com \
  -d *.local.direktforce.com
