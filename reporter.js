const Influx = require('influx');
const os = require('os');

const hostname = process.env.HOSTNAME || os.hostname();
const db = process.env.INFLUX_DB || 'hs110_db';

const { Client } = require('tplink-smarthome-api');

const client = new Client();

const influx = new Influx.InfluxDB({
    host: process.env.INFLUX_HOST || 'localhost',
    database: db,
    username: process.env.INFLUX_USERNAME || 'root',
    password: process.env.INFLUX_PASSWORD || 'root',
    schema: [
        {
            measurement: 'power_consumption',
            fields: {
                current: Influx.FieldType.FLOAT,
                voltage: Influx.FieldType.FLOAT,
                total: Influx.FieldType.FLOAT,
                power: Influx.FieldType.FLOAT,
            },
            tags: [
                'host', 'alias'
            ]
        }
    ]
});

class Reporter {
    export(res, sysInfo) {
        influx.writePoints([
            {
                measurement: 'power_consumption',
                tags: {
                    host: hostname,
                    alias: sysInfo.alias
                },
                fields: res,
            }
        ])
    }
    constructor() {
        this.timer = process.env.TIMER || 1500;
    }

    query(device) {
        return device.emeter.getRealtime()
    }

    format(raw) {
        delete raw.err_code;
        return raw
    }

    log(res, sysInfo) {
        if (!process.env.DEBUG) return res;
        console.log(sysInfo.alias, res);
        return res
    }

    checkDatabase() {
        return influx.getDatabaseNames()
            .then(names => {
                if (!names.includes(db)) {
                    return influx.createDatabase(db);
                }
            })
            .catch(err => {
                console.error(`Error creating Influx database!`);
            })
    }

    run() {
        this.checkDatabase()
            .then(_ => client.startDiscovery().on('device-new',
                dev => this.deviceFound(dev)));
    }

    deviceFound(device) {
        device.getSysInfo().then(sysInfo => {
            setInterval(_ => {
                this.query(device)
                    .then(res => this.format(res))
                    .then(res => this.log(res, sysInfo))
                    .then(res => this.export(res, sysInfo))
            }, this.timer);
        });
    }
}

module.exports = Reporter;
