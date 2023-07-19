# node-http

Pure Node.js http-based server exploration.

## References

- https://www.digitalocean.com/community/tutorials/how-to-create-a-web-server-in-node-js-with-the-http-module
- Typings: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/http.d.ts

## Routes

- `GET /`: "Hello, world!"
- `GET /users`: Array of user objects (JSON).
- `GET /users/{id}`: Single user object (JSON).
- `GET /users/{id}/profile`: User profile image (binary).
- `POST /users {user}`: Create user (JSON).
- `PUT /users/{id} {user}`: Update user (JSON).
- `DELETE /users/{id}`: Delete user.

## Run server

`npm start`
