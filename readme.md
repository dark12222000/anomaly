# Anomaly Auth0 Demo Exercise
A service to obtain, update, and parse the [FireHOL blocklists](https://github.com/firehol/blocklist-ipsets) into a high speed service to allow querying whether or not a given IP is on the list, and if so, which lists.

This is a demo project which was completed over the course of a few days, so it's lacking tests, significant robustness, etc. It's designed simply to prove the case, and shouldn't be actively deployed into production. However, if you were to deploy this, you should:

+ Handle redis disconnects, reconnects, and master failovers
+ Move from doing a single large bulk redis operation to doing a batch of smaller redis bulk operations
+ Seriously consider moving from expanded netranges as they consume a lot of memory.

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
