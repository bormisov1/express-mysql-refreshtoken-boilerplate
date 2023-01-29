const crypto = require("crypto");
const {
  national: formatPhoneNumberDependingOnCountry,
} = require("libphonenumber");
const jwt = require("jsonwebtoken");

const User = require("../db").User;
const { PASSWORD_SECRET, JWT_SECRET, JWT_EXPIRATION_TIME} = require("../config");

let jwtBlacklist = [];

async function computeHash(input, salt) {
  return new Promise((resolve) =>
    crypto.scrypt(input, salt, 64, (err, passHashBuf) => {
      if (err) throw err;
      resolve(passHashBuf.toString("hex"));
    })
  );
}

async function signin(id, password) {
  const user = await User.findOne({ where: { id } });
  if (!user) throw new Error("user_with_id_does_not_exist");
  const passHash = await computeHash(password, PASSWORD_SECRET);
  if (passHash !== user.passHash) throw new Error("wrong_password");
  return { accessToken: await makeJWT(id) };
}

function makeUnauthorizedError() {
  const err = new Error("unauthorized");
  err.status = 401;
  return err;
}

async function authenticateAccess(tokenHeader) {
  const token = parseAuthHeader(tokenHeader);
  if (!tokenHeader || !token || jwtBlacklist.includes(token)) throw makeUnauthorizedError();
  const payload = await verifyJWT(token);
  if (!payload) throw makeUnauthorizedError();
  return {payload, token};
}

async function issueAccessToken(tokenHeader) {
  if (!tokenHeader) throw makeUnauthorizedError();
  const user = await User.findOne({
    where: { refreshToken: Buffer.from(parseAuthHeader(tokenHeader), "base64") },
  });
  if (!user) throw makeUnauthorizedError();
  return { accessToken: await makeJWT(user.id) };
}

async function signup(id, password) {
  const passHash = await computeHash(password, PASSWORD_SECRET);
  const refreshToken = crypto.randomBytes(64);
  await User.create({ id, passHash, refreshToken }).catch((err) => {
    throw new Error("failed_to_signup_with_provided_parameters");
  });
  return {
    accessToken: await makeJWT(id),
    refreshToken: refreshToken.toString("base64"),
  };
}

async function logout(tokenHeader) {
  jwtBlacklist.push(parseAuthHeader(tokenHeader))
  return { ok: true };
}

function formatId(id) {
  return new Promise((resolve, reject) => {
    const formatted = validateFormatIdAsPhoneOrEmail(id);
    if (formatted !== null) return resolve(formatted);
    reject(new Error("id_must_be_email_or_phone_number"));
  });
}

function validateFormatIdAsPhoneOrEmail(id) {
  try {
    return formatPhoneNumberDependingOnCountry(id);
  } catch (e) {}
  const isEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(id);
  if (isEmail) return id.toLowerCase();
  return null;
}

async function makeJWT(id) {
  return new Promise(resolve => {
    jwt.sign({id}, JWT_SECRET, {expiresIn: JWT_EXPIRATION_TIME}, (err, token) => {
      if (err) throw err;
      resolve(token);
    })
  })
}

async function verifyJWT(token) {
  return new Promise(resolve => {
    jwt.verify(token, JWT_SECRET, {}, (err, payload) => {
      if (err) {
        return resolve(null)
      }
      resolve(payload);
    })
  });
}

async function maintainJwtBlacklist() {
  const jwtBlacklistExpired = await Promise.all(jwtBlacklist.map(async token => await verifyJWT(token) === null))
  jwtBlacklist = jwtBlacklist.filter((token, i) => jwtBlacklistExpired[i])
}

function parseAuthHeader(header) {
  if (!header || !header.split) return '';
  return header.split(' ')[1] || ''
}

module.exports = {
  signin,
  signup,
  logout,
  authenticateAccess,
  issueAccessToken,
  formatId,
  maintainJwtBlacklist
};
