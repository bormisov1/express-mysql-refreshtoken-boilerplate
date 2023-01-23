const env = require("dotenv");

env.config();

module.exports = {
  DB_HOST: process.env.DB_HOST,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  PASSWORD_SECRET: "myy32-character-ultra-secure-and-ultra-long-secret",
};
