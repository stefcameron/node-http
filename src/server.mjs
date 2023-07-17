import http from 'http';
import process from 'process';
import * as routes from './routes.mjs';

//
// ENV VARIABLES
//
// - PORT: Override default (8000).
//

const host = 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

/**
 * Responds to all requests.
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const requestListener = function (req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  switch (url.pathname) {
    case '/':
      routes.handleGetRoot({ req, res, url });
      break;

    case '/users':
      routes.handleGetUsers({ req, res, url });
      break;

    default: {
      const match = url.pathname.match(/\/users\/(\d+)$/);
      if (match) {
        const id = parseInt(match[1], 10);
        routes.handleGetUser({ req, res, url, id });
        break;
      }

      res.writeHead(404);
      res.end("These are not the droids you're looking for...");
      break;
    }
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}...`);
});
