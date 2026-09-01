const mqtt = require('mqtt');
const http = require('http');

const BAMBU_IP = process.env.BAMBU_IP;
const BAMBU_ACCESS = process.env.BAMBU_ACCESS;
const BAMBU_SERIAL = process.env.BAMBU_SERIAL;

const PORT = 30971;

const client = mqtt.connect(`mqtts://${BAMBU_IP}:8883`, {
  username: 'bblp',
  password: BAMBU_ACCESS,
  rejectUnauthorized: false,
});

let status = {};

client.on('connect', () => {
  client.subscribe(`device/${BAMBU_SERIAL}/report`);
  console.log(`Client: connected to ${BAMBU_IP}`);
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

  ['command', 'msg', 'sequence_id'].forEach(key => {
    delete _status[key];
  });

  status = _status;
});

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(status));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server: running on http://localhost:${PORT}`);
});
