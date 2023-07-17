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

const users = [
  {
    id: 1,
    name: 'Fred',
    email: 'fred@flitstone.com',
    phone: '123-456-7890',
  },
  {
    id: 2,
    name: 'Wilma',
    email: 'wilma@flitstone.com',
    phone: '456-123-7890',
  },
  {
    id: 3,
    name: 'Barney',
    email: 'barney@rubble.com',
    phone: '111-123-4567',
  },
];

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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
    return;
  }

  res.writeHead(404);
  res.end('User not found');
};
