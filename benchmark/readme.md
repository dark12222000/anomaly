# Benchmark Suite for Anomaly Service

Uses ApacheBench, which should be available on your platform of choice. To get ab on some common platforms:

On OS X using [brew](http://brew.sh), `brew install homebrew/apache/ab`

On Ubuntu, `sudo apt-get install apache2-utils`

The parallel_bench uses, unsurprisingly, `parallel`, which is also widely available.

On OS X using brew, `brew install parallel`

On Ubuntu, `sudo apt-get install parallel`

## Scripts

All scripts support the following options:

```
-u  Specify url. Defaults to http://localhost
-p  Specify port. Defaults to 3000
```

Each script will run a 30 second test with default settings and report the results.

+ `bad_ip_bench.sh`
Tests against a non-existent IP
+ `existing_ip_bench`
Tests against a handpicked IP. By default this is '127.0.0.1' but you can optionally provide an IP with `-i`
+ `malformed_bench`
Tests without supply an IP
+ `random_ip_bench`
Required `redis-cli` and that you can connect to redis on `localhost:6379` without a password. Will grab a random key and use that to test against.
