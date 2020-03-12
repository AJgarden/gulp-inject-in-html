const fs = require("fs");
module.exports = function injectCSS(inject, path, src) {
  return inject !== null
    ? `<style>${fs.readFileSync(path)}</style>`
    : `<link href="${src}" rel="stylesheet" />`;
};
