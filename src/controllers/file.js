const fs = require("fs");

const fileUpload = require("express-fileupload");

const fileService = require("../services/file");

async function upload(req, res, next) {
  fileService
    .saveAndRegister(Object.values(req.files)[0])
    .then((result) => res.json(result))
    .catch(next);
}

function list(req, res, next) {
  fileService
    .list(req.query["list_size"] || 10, req.query["page"] || 1)
    .then((result) => res.json(result))
    .catch(next);
}

function remove(req, res, next) {
  fileService
    .remove(req.params.id)
    .then((result) => res.json(result))
    .catch(next);
}

function details(req, res, next) {
  fileService
    .details(req.params.id)
    .then((result) => res.json(result))
    .catch(next);
}

function download(req, res, next) {
  fileService
    .getPath(req.params.id)
    .then((result) => res.download(result))
    .catch(next);
}

function update(req, res, next) {
  fileService
    .update(req.params.id, Object.values(req.files)[0])
    .then((result) => res.json(result))
    .catch(next);
}

const acceptFile = fileUpload({
  defCharset: "utf8",
  defParamCharset: "utf8",
});

module.exports = {
  upload,
  list,
  remove,
  details,
  download,
  update,
  acceptFile,
};
