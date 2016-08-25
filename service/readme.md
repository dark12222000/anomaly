# Anomaly IP Lookup Service

Given an IP, returns back either a 404 for the IP not being listed, or an array of lists the IP appears on.

## Querying
```
GET /{ip}
```
Example:

```
GET /127.0.0.1
```

## Response
Content type is `json`

```
["firehol_level1", "iblocklist_isp_aol"]
```

## Requirements
Redis should be reachable, and the redis details should be in your config. In production this is `config/config.production.json`. See `config/config.sample.json` for a sample config.
