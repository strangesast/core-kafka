#!/bin/bash
# npm install -g graphqurl
gq https://localhost/v1/graphql -H 'X-Hasura-Admin-Secret: adminsecretkey' --introspect > schema.graphql
