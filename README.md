       _____ ____  _____  ______ 
      / ____/ __ \|  __ \|  ____| 
     | |   | |  | | |__) | |__    
     | |   | |  | |  _  /|  __|   
     | |___| |__| | | \ \| |____  
      \_____\____/|_|  \_\______| 

[![Build Status](https://travis-ci.com/strangesast/core.svg?branch=master)](https://travis-ci.com/strangesast/core)
[![Coverage Status](https://coveralls.io/repos/github/strangesast/core/badge.svg)](https://coveralls.io/github/strangesast/core)
- [ ] Timeclock
  - [ ] Daemon
  - [ ] Interface
    - [ ] Dashboard
    - [ ] Each user page (current / historical)
    - [ ] Shift editor
- [ ] Users
  - [ ] Login
- [ ] Work orders
- [ ] Parts
- [ ] Station Kiosk
  - [ ] Machine Status
- [ ] Work Scheduling
- [ ] Code Organization
  - [ ] Editor
  - [ ] FTP


# Project Components
## Timeclock
- Handpunch timeclock connected via serial to PC running management daemon and MYSQL db (polled at regular interval)
- Data injested on schedule and by request via AMGTime XMLRPC client API, saved to postgres table
- Hasura graphql-engine tracks tables and provides graphql endpoint w/ realtime updates
- Angular client application presents data with notifications, tables, and graphs
## Machine Monitoring
- MTConnect agent or adapter collects machine data over network
- Sent via producer into Kafka topic
- Kafka streams processes input, produces to postgres table
- Hasura graphql-engine tracks tables and provides graphql endpoint w/ realtime updates
- Angular client application presents data with notifications, tables, and graphs
## User, Part, Customer, & Others
- Manage these objects
- Print things (labels, routers, hot-jobs tables)

# Notes
### Build Multiplatform
```
docker buildx build --platform=linux/amd64,linux/arm64,linux/arm/v7,linux/386 -t strangesast/core_connector -f docker/serial-monitoring/Dockerfile --push .
```
