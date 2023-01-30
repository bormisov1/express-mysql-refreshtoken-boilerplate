# Node Web Application boilerplate

A boilerplate for **Node.js** web applications. It uses express.js, sequelize for mysql interaction. It uses bearer token for auth, which gets invalidated on `/logout`. On signup refresh token is returned alongside with access token, the former allows issuing new access token by requesting `/signin/new_token`. User model has id and passHash fields. Id is expected to be either a phone number or email.

### Suggested commands

`npm i`
`docker-compose up`

### Folder Structure

```
.
├── app/
│   ├── controllers/           # Controllers
│   ├── services/              # Services
│   ├── db/                    # Database and models
│   ├── routes/                # Route definitions
├── config.js                  # Gateway between config (partially from .env) and the rest of the app
├── index.js                   # Express application
├── package.json               # NPM Dependencies and scripts
└── .env                       # API keys, passwords, and other sensitive information
```
#### .env example
```
PORT = 3000

DB_HOST=db
DB_PORT=3306
DB_DATABASE=mydatabase
DB_USERNAME=root
DB_PASSWORD=password
```
## Contributing

This boilerplate is open to suggestions and contributions, documentation contributions are also welcome! 😊
