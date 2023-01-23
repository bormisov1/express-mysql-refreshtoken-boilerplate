const fs = require("fs");

const File = require("../db").File;

const FILES_PATH = "./uploads";

async function saveAndRegister(file) {
  const fileRow = await File.create({
    name: file.name,
    extension: file.name.split(".").pop(),
    mimetype: file.mimetype,
    size: file.size / 1024 / 1024,
  }).catch((err) => {
    throw new Error("failed_to_upload_provided_file");
  });
  await writeFile(fileRow.id, fileRow.extension, file.data);
}

function list(listSize, page) {
  return File.findAndCountAll({
    offset: (page - 1) * +listSize,
    limit: +listSize,
  }).then((result) => result.rows);
}

async function remove(id) {
  const { name } = await getById(id);
  await removeFile(`${FILES_PATH}/${name}`);
  return File.destroy({ where: { id } });
}

function details(id) {
  return getById(id);
}

async function getPath(id) {
  const file = await File.findOne({ where: { id } });
  return `${FILES_PATH}/${file.name}`;
}

async function update(id, file) {
  const extension = file.name.split(".").pop();
  await File.update(
    {
      name: file.name,
      extension,
      mimetype: file.mimetype,
      size: file.size / 1024 / 1024,
    },
    { where: { id } }
  );
  await writeFile(file.id, extension, file.data);
}

function createFilesDir() {
  return createDir(FILES_PATH);
}

function createDir(path) {
  return new Promise(async (resolve) => {
    fs.readdir(path, async (err, files) => {
      if (err) {
        if (err.code === "ENOENT") {
          fs.mkdirSync(path);
          return resolve();
        } else {
          throw err;
        }
      }
      resolve();
    });
  });
}

function writeFile(id, extension, data) {
  return new Promise((resolve) =>
    fs.writeFile(
      `${FILES_PATH}/${id}.${extension}`,
      data,
      null,
      async (err) => {
        if (err) throw err;
        resolve();
      }
    )
  );
}

function removeFile(path) {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

async function getById(id) {
  const fileRow = await File.findOne({ where: { id } });
  if (!fileRow) throw new Error("invalid_file_id");
  return fileRow;
}

module.exports = {
  saveAndRegister,
  list,
  remove,
  details,
  getPath,
  update,
  createFilesDir,
};
