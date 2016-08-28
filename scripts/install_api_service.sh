#!/bin/bash

cd service/

sudo forever-service install anomaly --script index.js

cd -
