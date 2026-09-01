bambu-status
============

A lightweight HTTP status server for Bambu Lab printers. It connects to a
printer's local MQTT broker, tracks the latest print status, and exposes it as
JSON over HTTP. Includes a bash CLI helper for quick status checks (e.g., in a
shell prompt or status bar).

Configuration
-------------

The server reads printer connection details from environment variables:

| Variable       | Description                     |
|----------------|---------------------------------|
| `BAMBU_IP`     | IP address of the printer       |
| `BAMBU_ACCESS` | Access code (LAN mode password) |
| `BAMBU_SERIAL` | Printer serial number           |

The HTTP server listens on port `30971`.

Running
-------

```sh
npm start
```

Or via systemd, using the included `bambu-status.service` unit file:

```sh
sudo cp bambu-status.service /etc/systemd/system/
sudo systemctl enable bambu-status
sudo systemctl start bambu-status
```

The unit file doesn't set `BAMBU_IP`, `BAMBU_ACCESS`, or `BAMBU_SERIAL`.
Provide them via a systemd override:

```sh
sudo systemctl edit bambu-status
```

Add to the override file:

```ini
[Service]
Environment=BAMBU_IP=192.168.1.100
Environment=BAMBU_ACCESS=your-access-code
Environment=BAMBU_SERIAL=your-serial-number
```

The unit file's `User`, `Group`, and `WorkingDirectory` (default `bambu` /
`bambu` / `/opt/bambu-status`) can be overridden the same way if needed:

```ini
[Service]
User=otheruser
Group=othergroup
WorkingDirectory=/path/to/bambu-status
```

Then apply it:

```sh
sudo systemctl daemon-reload
sudo systemctl restart bambu-status
```

CLI
---

The `bambu-status` bash script queries the running server and prints a
short status summary (e.g. remaining time, progress percentage, paused
state). It reads from the server via HTTP:

| Variable                 | Description                            |
|--------------------------|----------------------------------------|
| `BAMBU_STATUS_URL`       | URL of the running bambu-status server |
| `BAMBU_STATUS_API_KEY`   | Sent as `X-API-Key` header             |

> `bambu-status.js` does not validate the `X-API-Key` header itself. If you want
> to restrict access to the status endpoint, enforce this at a reverse proxy in
> front of the server.

```sh
bambu-status        # prints short status, e.g. "1h, 20m (45%)"
bambu-status --raw  # prints full raw JSON status
```

License
-------
This software is released under the terms of the **MIT license**. See `LICENSE`.
