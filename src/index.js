const express = require("express");

const routes = require("./routes");
const { initializeDB } = require("./db");
const { JWT_BLACKLIST_MAINTAIN_PAUSE } = require('./config')
const { createCleanFilesDir } = require("./services/file");
const { maintainJwtBlacklist } = require("./services/auth");

const app = express();
app.use(express.json());
app.use(routes);
app.use(function (req, res, next) {
  let err = new Error("not_found");
  err.status = 404;
  next(err);
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message,
    ok: false,
  });
});
initializeDB()
  .then(createCleanFilesDir)
  .then(() => {
    setInterval(maintainJwtBlacklist, JWT_BLACKLIST_MAINTAIN_PAUSE)
  })
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`App listening on port ${process.env.PORT}`)
    );
  });
