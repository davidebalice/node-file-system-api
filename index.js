const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const rootDirectory = "files";

app.get("/items", (req, res) => {
  const directoryPath =
    rootDirectory + "/" + req.query.directory || rootDirectory;

  getItems(directoryPath, (err, items) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json({ items });
  });
});

function getItems(directoryPath, callback) {
  fs.readdir(directoryPath, (err, items) => {
    if (err) {
      return callback(err);
    }

    const itemList = [];

    items.forEach((item) => {
      const itemPath = path.join(directoryPath, item);

      fs.stat(itemPath, (err, stats) => {
        if (err) {
          return callback(err);
        }

        itemList.push({
          name: item,
          type: stats.isDirectory() ? "directory" : "file",
        });

        if (stats.isDirectory()) {
          getItems(itemPath, (err, subItems) => {
            if (err) {
              return callback(err);
            }
            itemList.push(...subItems);
            // Invia la lista degli elementi una volta completato il loop
            if (itemList.length === items.length) {
              callback(null, itemList);
            }
          });
        } else {
          if (itemList.length === items.length) {
            callback(null, itemList);
          }
        }
      });
    });
  });
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
