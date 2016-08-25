# Anomaly
A service for FireHOL blocklist

## Components

### Worker
A worker process, capable of being run in parallel and designed to be kicked off by a cron task. The worker pulls the FireHOL blocklist from git using git commands, and feeds it into the redis instance by uploading a redis command file via redis-cli.

### Service
The service, capable of being deployed in HA situations and designed for multiple instances to be run at once, on each query reads from redis and responds with the status of the queried IP.

### Benchmark
A tool designed to test and measure response time from the Service. Capable of querying several instances (either through a load balancer or via round robin) with configuration parameters for the IP range tested and the amount of queries to run.

## Dependencies

+ Node.js
+ NPM
+ Redis

Each component is written in javascript and designed to be run in Node.js. Worker requires `git` and `redis-cli` to be available, and Service will take advantage of having `hiredis` installed locally.
