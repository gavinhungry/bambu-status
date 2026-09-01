const mqtt = require('mqtt');
const http = require('http');

const ENV = {};

['BAMBU_IP', 'BAMBU_ACCESS', 'BAMBU_SERIAL'].forEach(envVar => {
  const value = process.env[envVar];
  if (!value) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }

  ENV[envVar] = value;
});

const PORT = 30971;

const client = mqtt.connect(`mqtts://${ENV.BAMBU_IP}:8883`, {
  username: 'bblp',
  password: ENV.BAMBU_ACCESS,
  rejectUnauthorized: false,
});

let status = {};

client.on('connect', () => {
  client.subscribe(`device/${ENV.BAMBU_SERIAL}/report`);
  console.log(`MQTT: connected to ${ENV.BAMBU_IP}`);
  status = {};
});

client.on('error', (err) => {
  console.error('Client error:', err.message);
});

client.on('message', (topic, payload) => {
  let data;

  try {
    data = JSON.parse(payload.toString());
  } catch (err) {
    console.error('Failed to parse message:', err.message);
    return;
  }

  let print = data?.print || {};

  let _status = {
    ...status,
    ...print,
    last_updated: Math.floor(+new Date() / 1000)
  };

  status = _status;
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(status));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`HTTP: running on http://localhost:${PORT}`);
});
