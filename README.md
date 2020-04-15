# Quarantined Wizzards

![Node.js CI](https://github.com/creisle/quarantined_wizzards/workflows/Node.js%20CI/badge.svg)

A family favourite game brought online to support social distancing!

This project uses [redis](https://redis.io/), [socket.io](https://socket.io/), and [React.js](https://reactjs.org/).

## Getting Started (Developers)

Before the server can be run redis should be installed and the redis server running

```bash
redis-server
```

Next start the server

```bash
npm run start:server
```

And then the client development server (webpack)

```bash
npm start
```

The client can now be viewed in the browser at [http://localhost:3000](http://localhost:3000).
