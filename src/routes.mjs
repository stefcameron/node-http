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
 * Responds to 'GET /error', simulating a server-side unexpected error.
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
 * Responds to 'GET /users/{id}'
 * @param {Object} params
 * @param {http.IncomingMessage} params.req
 * @param {http.ServerResponse} params.res
 * @param {URL} params.url
 * @param {number} params.id User ID.
 */
export const handleGetUser = function ({ req, res, url, id }) {
  // consistently return JSON
  res.setHeader('Content-Type', 'application/json');

  const user = users.find((u) => u.id === id);
  if (user) {
    res.writeHead(200);
    res.end(JSON.stringify(user));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
  }
};

/**
 * Responds to 'GET /users/{id}/profile'
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
  res.end('Not found');
};

/**
 * Responds to 'POST /users {user}'
 * @param {Object} params
 * @param {http.IncomingMessage} params.req
 * @param {http.ServerResponse} params.res
 * @param {URL} params.url
 */
export const handleCreateUser = function ({ req, res, url }) {
  // TODO: could move this into `req.on('end')` and the ELSE block so as to
  //  avoid sending headers prematurely (see NOTE below about status code)
  //  @see `handleUpdateUser()` for a different way of doing this
  res.setHeader('Content-Type', 'application/json');

  if (req.headers['content-type'] === 'application/json') {
    return new Promise((resolve) => {
      let payload = '';
      req.on('data', (data) => {
        payload = `${payload}${data}`;
      });

      req.on('end', () => {
        try {
          const json = JSON.parse(payload);
          const user = {
            ...json, // TODO: validate this against a user schema...

            // NOTE: replace any ID with our own unique one since we're creating,
            //  not updating
            id: users.reduce((acc, u) => {
              return Math.max(acc, u.id + 1);
            }, 0),
          };

          // add user to DB
          users.push(user);

          // NOTE: since we're handling this later than when headers were initially
          //  sent, we have to use the `statusCode` property instead of `res.writeHead(status)`
          //  because that method sets default headers and setting headers after they're
          //  sent will cause an exception
          res.statusCode = 201; // CREATED

          res.end(JSON.stringify(user));
        } catch (err) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid data format' }));
        }

        resolve();
      });
    });
  } else {
    res.writeHead(400);
    res.end(JSON.stringify({ error: 'Bad request' }));
  }
};

/**
 * Responds to 'PUT /users/{id} {user}'
 * @param {Object} params
 * @param {http.IncomingMessage} params.req
 * @param {http.ServerResponse} params.res
 * @param {URL} params.url
 * @param {number} params.id User ID.
 */
export const handleUpdateUser = function ({ req, res, url, id }) {
  const resHeaders = { 'Content-Type': 'application/json' };

  if (req.headers['content-type'] === 'application/json') {
    return new Promise((resolve) => {
      let payload = '';
      req.on('data', (data) => {
        payload = `${payload}${data}`;
      });

      // NOTE: wait until we have the payload in order to check if the user exists
      //  because the user could get deleted in the time it takes to receive the
      //  payload data and the time at which we get the stream's 'end' event; it's
      //  safe to check at this point because the only thing that's left to do now
      //  is __synchronously__ check for existence and update if possible
      req.on('end', () => {
        const userIdx = users.findIndex((u) => u.id === id);
        if (userIdx >= 0) {
          try {
            // TODO: validate `json` against a user schema...
            const json = JSON.parse(payload);

            // update user in DB
            const user = users[userIdx];
            users[userIdx] = { ...user, ...json };

            res.writeHead(200, resHeaders); // already exists so just OK
            res.end(JSON.stringify(users[userIdx]));
          } catch (err) {
            res.writeHead(400, resHeaders);
            res.end(JSON.stringify({ error: 'Invalid data format' }));
          }
        } else {
          res.writeHead(404, resHeaders);
          res.end(JSON.stringify({ message: 'Not found' }));
        }

        resolve();
      });
    });
  } else {
    res.writeHead(400, resHeaders);
    res.end(JSON.stringify({ error: 'Bad request' }));
  }
};

/**
 * Responds to 'DELETE /users/{id}'
 * @param {Object} params
 * @param {http.IncomingMessage} params.req
 * @param {http.ServerResponse} params.res
 * @param {URL} params.url
 * @param {number} params.id User ID.
 */
export const handleRemoveUser = function ({ req, res, url, id }) {
  // consistently return JSON
  res.setHeader('Content-Type', 'application/json');

  const userIdx = users.findIndex((u) => u.id === id);
  if (userIdx >= 0) {
    users.splice(userIdx, 1);
    res.writeHead(204); // no content
    res.end();
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'not found' }));
  }
};
