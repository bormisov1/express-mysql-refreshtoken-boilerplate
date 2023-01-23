const crypto = require("crypto");
const {
  national: formatPhoneNumberDependingOnCountry,
} = require("libphonenumber");

const User = require("../db").User;
const { PASSWORD_SECRET } = require("../config");

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
  const accessToken = crypto.randomBytes(64);
  user.accessToken = accessToken;
  await user.save();
  return { accessToken: accessToken.toString("base64") };
}

function makeUnauthorizedError() {
  const err = new Error("unauthorized");
  err.status = 401;
  return err;
}

async function authenticateAccess(tokenHeader) {
  const token = tokenHeader?.split(" ")[1];
  if (!tokenHeader || !token) throw makeUnauthorizedError();
  const user = await User.findOne({
    where: { accessToken: Buffer.from(token, "base64") },
  });
  if (!user) throw makeUnauthorizedError();
  return user;
}

async function issueAccessToken(token) {
  if (!token) throw makeUnauthorizedError();
  const user = await User.findOne({
    where: { refreshToken: Buffer.from(token.split(" ")[1], "base64") },
  });
  if (!user) throw makeUnauthorizedError();
  user.accessToken = crypto.randomBytes(64);
  await user.save();
  return { accessToken: user.accessToken.toString("base64") };
}

async function signup(id, password) {
  const passHash = await computeHash(password, PASSWORD_SECRET);
  const tokens = {
    accessToken: crypto.randomBytes(64),
    refreshToken: crypto.randomBytes(64),
  };
  await User.create({ id, passHash, ...tokens }).catch((err) => {
    throw new Error("failed_to_signup_with_provided_parameters");
  });
  return {
    accessToken: tokens.accessToken.toString("base64"),
    refreshToken: tokens.refreshToken.toString("base64"),
  };
}

async function logout(id) {
  await User.update({ accessToken: null }, { where: { id } });
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

module.exports = {
  signin,
  signup,
  logout,
  authenticateAccess,
  issueAccessToken,
  formatId,
};
