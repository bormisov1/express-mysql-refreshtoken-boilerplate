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
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(next);
}

function issueAccessToken(req, res, next) {
  authService
    .issueAccessToken(req.get("authorization"))
    .then((result) => res.json(result))
    .catch(next);
}

function logout(req, res, next) {
  authService
    .logout(req.user.id)
    .then((result) => res.json(result))
    .catch(next);
}

async function formatId(req, res, next) {
  req.body.id = await authService.formatId(req.body.id).catch(next);
  next();
}

module.exports = {
  signup,
  signin,
  logout,
  issueAccessToken,
  authenticateAccess,
  formatId,
};
