# Anomaly-Worker

+ Clones FireHOL to a local folder if it doesn't exit
+ If it does exist, does a 'git pull' for the latest master
+ Processes each file, loading each IP into redis, expanding any netranges it comes across
+ Works best set up as a cron task

## Requirements

+ `git` available locally
+ (Optionally but suggested) A c-compiler to build hiredis for improved performance
