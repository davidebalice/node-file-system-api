const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const catchAsync = require("../middlewares/catchAsync");
const fs = require("fs");
const path = require("path");
const rootDirectory = "files";

exports.getFiles = catchAsync(async (req, res, next) => {
  const parentDir = path.resolve(__dirname, "..");
  let directoryPath = rootDirectory;
  const dirName = req.query.dir;
  let filePath = rootDirectory;

  if (dirName !== undefined && dirName.trim() !== "") {
    directoryPath = path.join(parentDir, rootDirectory, dirName);
  }
  getItems(directoryPath, (err, items) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ items });
  });
});

exports.getFile = catchAsync(async (req, res, next) => {
  const parentDir = path.resolve(__dirname, "..");
  const fileName = req.query.filename;
  const dirName = req.query.dir;
  if (!fileName) {
    return res.status(400).json({ error: "File name not provided" });
  }
  let filePath = rootDirectory;
  if (dirName) {
    filePath = path.join(parentDir, rootDirectory + "/" + dirName, fileName);
  } else {
    filePath = path.join(parentDir, rootDirectory, fileName);
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).json({ error: "File not found" });
    }
    res.send({ title: fileName, content: data });
  });
});

exports.checkDirectory = catchAsync(async (req, res, next) => {
  const dirName = req.query.dir;
  const directoryPath = path.join(__dirname, "..", rootDirectory, dirName);

  try {
    const stats = await fs.promises.stat(directoryPath);
    if (stats.isDirectory()) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
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

exports.newFile = catchAsync(async (req, res, next) => {
  if (global.demo) {
    res.status(200).json({
      title: "Demo mode",
      status: "demo",
    });
  } else {
    const parentDir = path.resolve(__dirname, "..");
    const fileName = req.body.filename;
    const dirName = req.body.dir;

    if (!fileName) {
      return res.status(400).json({ error: "File name not provided" });
    }
    let filePath = rootDirectory;
    if (dirName) {
      filePath = path.join(parentDir, rootDirectory + "/" + dirName, fileName);
    } else {
      filePath = path.join(parentDir, rootDirectory, fileName);
    }

    fs.writeFile(filePath, "", (err, data) => {
      if (err) {
        return res.status(404).json({ error: "File not found" });
      }
      res.send({ title: fileName, content: data });
    });
  }
});

exports.saveFile = catchAsync(async (req, res, next) => {
  if (global.demo) {
    res.status(200).json({
      title: "Demo mode",
      status: "demo",
    });
  } else {
    const parentDir = path.resolve(__dirname, "..");
    const fileName = req.body.filename;
    const dirName = req.body.dir;
    const content = req.body.content;
    if (!fileName) {
      return res.status(400).json({ error: "File name not provided" });
    }
    let filePath = rootDirectory;
    if (dirName) {
      filePath = path.join(parentDir, rootDirectory + "/" + dirName, fileName);
    } else {
      filePath = path.join(parentDir, rootDirectory, fileName);
    }

    fs.writeFile(filePath, content, (err, data) => {
      if (err) {
        return res.status(404).json({ error: "File not found" });
      }
      res.send({ title: fileName, content: data });
    });
  }
});

exports.deleteFile = catchAsync(async (req, res, next) => {
  if (global.demo) {
    res.status(200).json({
      title: "Demo mode",
      status: "demo",
    });
  } else {
    const parentDir = path.resolve(__dirname, "..");
    const fileName = req.body.filename;
    const dirName = req.body.dir;

    console.log(dirName);
    console.log(fileName);

    if (!fileName) {
      return res.status(400).json({ error: "File name not provided" });
    }

    let filePath = path.join(parentDir, rootDirectory, fileName);
    if (dirName) {
      filePath = path.join(parentDir, rootDirectory, dirName, fileName);
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(404).json({ error: "File not found" });
      }
      res.status(200).json({ message: "File deleted successfully" });
    });
  }
});

exports.renameFile = catchAsync(async (req, res, next) => {
  if (global.demo) {
    res.status(200).json({
      title: "Demo mode",
      status: "demo",
    });
  } else {
    const parentDir = path.resolve(__dirname, "..");
    const oldFileName = req.body.oldFileName;
    const newFileName = req.body.newFileName;
    const dirName = req.body.dir;

    if (!oldFileName || !newFileName) {
      return res.status(400).json({ error: "File names not provided" });
    }

    let oldFilePath = path.join(parentDir, rootDirectory, oldFileName);
    let newFilePath = path.join(parentDir, rootDirectory, newFileName);

    if (dirName) {
      oldFilePath = path.join(parentDir, rootDirectory, dirName, oldFileName);
      newFilePath = path.join(parentDir, rootDirectory, dirName, newFileName);
    }

    fs.rename(oldFilePath, newFilePath, (err) => {
      if (err) {
        return res
          .status(404)
          .json({ error: "File not found or renaming failed" });
      }
      res.status(200).json({ message: "File renamed successfully" });
    });
  }
});

exports.getPhoto = catchAsync(async (req, res, next) => {
  const filename = req.params.filename;
  const filePath = path.join(process.env.FILE_PATH, rootDirectory, filename);
  res.sendFile(filePath);
});
