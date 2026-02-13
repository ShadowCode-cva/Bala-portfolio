## GitHub Copilot Chat

- Extension: 0.37.6 (prod)
- VS Code: 1.109.3 (b6a47e94e326b5c209d118cf0f994d6065585705)
- OS: win32 10.0.26200 x64
- GitHub Account: ShadowCode-cva

## Network

User Settings:
```json
  "http.systemCertificatesNode": false,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.207.73.85 (40 ms)
- DNS ipv6 Lookup: Error (40 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (0 ms)
- Electron fetch (configured): Error (1509 ms): Error: net::ERR_CONNECTION_TIMED_OUT
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  [object Object]
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: 