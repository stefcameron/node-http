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
const requestListener = async function (req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const routeName = `'${req.method} ${url.pathname}'`;
  console.log(`[server] Received request for ${routeName}`);

  try {
    switch (url.pathname) {
      case '/':
        if (req.method === 'GET') {
          await routes.handleGetRoot({ req, res, url });
        }
        break;

      case '/users':
        if (req.method === 'GET') {
          await routes.handleGetUsers({ req, res, url });
        } else if (req.method === 'POST') {
          await routes.handleCreateUser({ req, res, url });
        }
        break;

      case '/error':
        if (req.method === 'GET') {
          await routes.handleGetError({ req, res, url });
        }
        break;

      default: {
        const match = url.pathname.match(/\/users\/(\d+)(?:\/|$)/);
        const id = match ? parseInt(match[1], 10) : undefined;

        if (id !== undefined) {
          if (url.pathname.match(/\/users\/\d+$/)) {
            if (req.method === 'GET') {
              await routes.handleGetUser({ req, res, url, id });
            } else if (match && req.method === 'PUT') {
              await routes.handleUpdateUser({ req, res, url, id });
            } else if (match && req.method === 'DELETE') {
              await routes.handleRemoveUser({ req, res, url, id });
            }
          } else if (url.pathname.match(/\/users\/\d+\/profile$/)) {
            await routes.handleGetUserProfile({ req, res, url, id });
          }
        }
        // else, let it be a 404 (unknown route)

        break;
      }
    }
  } catch (err) {
    console.error(
      `[server][ERROR] Unexpected server error for ${routeName}: "${err.message}"`
    );
    if (!res.headersSent && res.writable) {
      // NOTE: this is probably NOT the right condition underwhich to assume we can
      //  send a 500, and there's probably a better way to structure the code so that
      //  route handlers aren't individually writing to the stream, but that the server
      //  core always does that so that it has better control over the response to send...
      res.writeHead(500);
      res.end('Unexpected error');
    }
  }

  if (!res.headersSent) {
    // assume no handler was found
    console.log(`[server] No handler found for ${routeName}`);
    res.writeHead(404);
    res.end('Not found');
  }

  console.log(`[server] Handled request for ${routeName}, status=${res.statusCode}`);
};

// NOTE: `requestListener` is automatically added to the `server`'s 'request' event, short for
//  `server.on('request', requestListener)`
const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log(`[server] Listening on http://${host}:${port}...`);

  server.on('close', () => {
    console.log('[server] Stopping');
  });

  process.on('SIGINT', async function () {
    console.log('Killing server...');

    try {
      server.close((err) => {
        if (err) {
          console.error(`ERROR stopping server: "${err.message}". Force-exiting.`);
        } else {
          console.log('Server killed');
        }
        process.exit(err ? 1 : 0);
      });
    } catch (err) {
      console.error(`ERROR stopping server: "${err.message}". Force-exiting.`);
      process.exit(err ? 1 : 0);
    }
  });
});
