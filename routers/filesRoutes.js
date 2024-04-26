const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const fileController = require('../controllers/fileController');
const bodyParser = require('body-parser');
const urlencodeParser = bodyParser.urlencoded({ extended: false });


router.route('/files').get(authController.protect, fileController.getFiles);
router.route('/file').get(authController.protect, fileController.getFile);




/*



app.get("/files", (req, res) => {
    let directoryPath = rootDirectory;
    if (req.query.directory !== undefined && req.query.directory.trim() !== "") {
      console.log("entrato");
      directoryPath = path.join(rootDirectory, req.query.directory);
    }
    getItems(directoryPath, (err, items) => {
      if (err) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
      console.log(items);
      res.json({ items });
    });
  });
  
  app.get("/file", (req, res) => {
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
  */






module.exports = router;