const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const catchAsync = require("../middlewares/catchAsync");
const fs = require("fs");
const path = require("path");
const rootDirectory = "files";

exports.getFiles = catchAsync(async (req, res, next) => {
  let directoryPath = rootDirectory;
  const dirName = req.query.dir;
  let filePath = rootDirectory;

  if (dirName !== undefined && dirName.trim() !== "") {
    directoryPath = path.join(rootDirectory, dirName);
  }
  getItems(directoryPath, (err, items) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ items });
  });
});

exports.getFile = catchAsync(async (req, res, next) => {
  const fileName = req.query.filename;
  const dirName = req.query.dir;
  if (!fileName) {
    return res.status(400).json({ error: "File name not provided" });
  }
  let filePath = rootDirectory;
  if (dirName) {
    filePath = path.join(__dirname, rootDirectory + "/" + dirName, fileName);
  } else {
    filePath = path.join(__dirname, rootDirectory, fileName);
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.send(data);
  });
});

exports.checkDirectory = catchAsync(async (req, res, next) => {
  const dirName = req.query.dir;
  const directoryPath = path.join(
    __dirname,
    "..",
    rootDirectory + "/" + dirName
  );

  if (fs.existsSync(directoryPath)) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
});

function getItems(directoryPath, callback) {
  fs.readdir(directoryPath, (err, items) => {
    if (err) {
      return callback(err);
    }

    let directories = [];
    let files = [];
    let processedCount = 0;

    if (items.length === 0) {
      return callback(null, []);
    }

    items.forEach((item) => {
      const itemPath = path.join(directoryPath, item);

      fs.stat(itemPath, (err, stats) => {
        if (err) {
          return callback(err);
        }

        if (stats.isDirectory()) {
          directories.push({
            name: item,
            type: "directory",
            size: 0,
          });
        } else {
          files.push({
            name: item,
            type: "file",
            size: stats.size,
          });
        }

        processedCount++;

        if (processedCount === items.length) {
          directories = directories.sort();
          files = files.sort();
          const sortedItems = directories.concat(files);
          callback(null, sortedItems);
        }
      });
    });
  });
}
