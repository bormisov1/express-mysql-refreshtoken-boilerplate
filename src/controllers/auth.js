const authService = require("../services/auth");

function signup(req, res, next) {
  authService
    .signup(req.body.id, req.body.password)
    .then((result) => res.json(result))
    .catch(next);
}

function signin(req, res, next) {
  authService
    .signin(req.body.id, req.body.password)
    .then((result) => res.json(result))
    .catch(next);
}

function authenticateAccess(req, res, next) {
  authService
    .authenticateAccess(req.get("authorization"))
    .then(({payload, token}) => {
      req.userId = payload.id;
      req.token = token;
      next();
    })
    .catch(next);
}

function issueAccessToken(req, res, next) {
  authService
    .issueAccessToken(req.token)
    .then((result) => res.json(result))
    .catch(next);
}

function logout(req, res, next) {
  authService
    .logout(req.token)
    .then((result) => res.json(result))
    .catch(next);
}

async function formatId(req, res, next) {
  authService.formatId(req.body.id).then(id => {
    req.body.id = id;
    next();
  }).catch(next);
}

module.exports = {
  signup,
  signin,
  logout,
  issueAccessToken,
  authenticateAccess,
  formatId,
};
