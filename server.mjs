import { createServer } from 'http';
import next from 'next';

const port = process.env.PORT || 3000;
const app = next({ dev: true });
const handle = app.getRequestHandler();

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
process.on('uncaughtException', (e) => console.error(e));
process.on('unhandledRejection', (e) => console.error(e));

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});

setInterval(() => {}, 10000);
