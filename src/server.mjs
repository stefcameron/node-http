import http from 'http';
import process from 'process';

//
// ENV VARIABLES
//
// - PORT: Override default (8000).
//

const host = 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;

/**
 * Responds to 'GET /'
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const handleGetHome = function (req, res) {
  // writing response headers, status, then optional message, and additional headers
  res.writeHead(200);

  // write something to the response stream and signal end of content (i.e. close the request)
  res.end('Hello, world!');
};

const server = http.createServer(handleGetHome);
server.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}...`);
});
