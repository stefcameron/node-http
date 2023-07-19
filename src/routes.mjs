import fsp from 'fs/promises';
import path from 'path';
import url from 'url';
import { users } from './data.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

/**
 * Responds to 'GET /'
 * @param {Object} params
 * @param {http.IncomingMessage} params.req
 * @param {http.ServerResponse} params.res
 * @param {URL} params.url
 */
export const handleGetRoot = function ({ req, res, url }) {
  // writing response headers, status, then optional message, and additional headers
  res.writeHead(200);

  // write something to the response stream and signal end of content (i.e. close the request)
  res.end('Hello, world!');
};

/**
 * Responds to 'GET /error'
 * @param {Object} params
 * @param {http.IncomingMessage} params.req
 * @param {http.ServerResponse} params.res
 * @param {URL} params.url
 */
export const handleGetError = function ({ req, res, url }) {
  throw new Error('Exception!!');
};

/**
 * Responds to 'GET /users'
 * @param {Object} params
 * @param {http.IncomingMessage} params.req
 * @param {http.ServerResponse} params.res
 * @param {URL} params.url
 */
export const handleGetUsers = function ({ req, res, url }) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(users));
};

/**
 * Responds to 'GET /users/{ID}'
 * @param {Object} params
 * @param {http.IncomingMessage} params.req
 * @param {http.ServerResponse} params.res
 * @param {URL} params.url
 * @param {number} params.id User ID.
 */
export const handleGetUser = function ({ req, res, url, id }) {
  const user = users.find((u) => u.id === id);
  if (user) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(user));
    return;
  }

  res.writeHead(404);
  res.end('User not found');
};

/**
 * Responds to 'GET /users/{ID}/profile'
 * @param {Object} params
 * @param {http.IncomingMessage} params.req
 * @param {http.ServerResponse} params.res
 * @param {URL} params.url
 * @param {number} params.id User ID.
 */
export const handleGetUserProfile = async function ({ req, res, url, id }) {
  const user = users.find((u) => u.id === id);
  if (user) {
    const profilePath = path.resolve(__dirname, '../assets/', user.profile);
    try {
      const stats = await fsp.stat(profilePath);
      if (stats.isFile()) {
        const data = await fsp.readFile(profilePath);
        res.setHeader('Content-Type', 'image/png');
        res.writeHead(200);
        res.end(data);
      }
    } catch (err) {
      throw err;
    }
    return;
  }

  res.writeHead(404);
  res.end('User not found');
};
