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
  console.log(`[server] Handling request for pathname=${url.pathname}`);

  try {
    switch (url.pathname) {
      case '/':
        routes.handleGetRoot({ req, res, url });
        break;

      case '/users':
        routes.handleGetUsers({ req, res, url });
        break;

      case '/error':
        routes.handleGetError({ req, res, url });
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
  } catch (err) {
    console.error(`[server][ERROR] Unexpected server error: "${err.message}"`);
    if (!res.headersSent && res.writable) {
      // NOTE: this is probably NOT the right condition underwhich to assume we can
      //  send a 500, and there's probably a better way to structure the code so that
      //  route handlers aren't individually writing to the stream, but that the server
      //  core always does that so that it has better control over the response to send...
      res.writeHead(500);
      res.end('Unexpected error');
    }
  }

  console.log(`[server] Handled request for pathname=${url.pathname}, status=${res.statusCode}`);
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`[server] Listening on http://${host}:${port}...`);
});
