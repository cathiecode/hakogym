export default {
  "services": {
    "main": {
      "program": "time-measurement-system.exe",
      "default_args": ["--config", "config.json"],
      "default_start": true,
      "allow_args_override": true
    },
    "gui": {
      "program": "time-measurement-system-gui.exe",
      "default_args": [],
      "default_start": true,
      "allow_args_override": true
    },
    "sensor": {
      "program": "time-measurement-system-sensor-io.exe",
      "default_args": [
        "--config",
        "config.json",
        "--com",
        "COM3",
        "--baud",
        "9600"
      ],
      "default_start": false,
      "allow_args_override": true
    },
    "google-spreadsheet-sync": {
      "program": "deps/node",
      "default_args": [
        "time-measurement-system-google-spreadsheet-sync/index.cjs",
        "secrets/google-api-secret.json",
        "",
        "A1"
      ],
      "default_start": false,
      "allow_args_override": true
    },
    "time-measurement-system-vlc-connection": {
      "program": "deps/node",
      "default_args": ["time-measurement-system-vlc-connection/index.cjs"],
      "default_start": false,
      "allow_args_override": false
    }
  },
  "record": {
    "metadata": {
      "schema": {
        "type": "object",
        "properties": {
          "carId": {
            "type": "string"
          },
          "pylonTouchCount": {
            "type": "number"
          },
          "derailmentCount": {
            "type": "number"
          },
          "status": {
            "type": "string",
            "enum": ["DNS", "MC", "DNF"],
            "nullable": true
          },
          "removed": {
            "type": "boolean"
          },
          "heat": {
            "type": "string",
            "nullable": true
          }
        },
        "required": ["carId", "pylonTouchCount", "derailmentCount", "removed"]
      },
      "default": {
        "carId": "",
        "pylonTouchCount": 0,
        "derailmentCount": 0,
        "heat": "",
        "removed": false
      }
    }
  },
  "server": {
    "addr": "[::1]:11000",
    "service_manager_addr": "[::1]:11001",
    "vlc": "[::1]:11002"
  }
} as const;