#!/bin/bash

cd service/

sudo forever-service install anomaly --script index.js -e "NODE_ENV=production"

cd -
