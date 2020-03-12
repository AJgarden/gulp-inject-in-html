const fs = require("fs");
module.exports = function injectHTML(path) {
  return fs.readFileSync(path);
};
