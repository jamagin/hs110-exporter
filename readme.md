# hs110 influx exporter

> A TP-link hs110 smart plug exporter for influxDB

# Install
```bash
git clone https://github.com/cgarnier/hs110-influx.git
npm i
```
# Usage

```bash
TIMER=1000 \
DEBUG=true \
INFLUX_HOST=influx.example.com \
INFLUX_USERNAME=root \
INFLUX_PASSWORD=blah \
HOSTNAME=rig_github \
BROADCAST_ADDR=10.0.0.255 \
npm start
```

All environment variables are optional, defaults are:
```
TIMER=1500
DEBUG=<unset>
INFLUX_HOST=localhost
INFLUX_PASSWORD=root
HOSTNAME=<os.hostname()>
BROADCAST_ADDR=<defaults to 255.255.255.255 in tplink_smarthome_api>
```

# Docker usage

```bash
# Run the exporter
docker run \
  -e INFLUX_HOST=influx.example.com \
  -d cgarnier/hs110-influx

```

# Metrics

Automatically discovers HS110 devices on the local network. Each device is tagged by its human readable 'alias' string.

This exporter export one metric: power_consumption with current, power, total and voltage.
