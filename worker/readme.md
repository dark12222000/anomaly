# Anomaly-Worker

+ Clones FireHOL to a local folder if it doesn't exit
+ If it does exist, does a 'git pull' for the latest master
+ Processes each file, loading each IP into a text file of redis commands, expanding any netranges it comes across
+ Uploads the redis command file to redis using redis-cli
+ Works best set up as a cron task

## Requirements

+ `git` available locally
+ `redis-cli` available locally
