const fs = require("fs");
module.exports = function injectJS(type, async, defer, path, src) {
  let attr = "";
  attr += async !== null ? " async" : "";
  attr += defer !== null ? " defer" : "";
  return type !== null
    ? `<script type="text/javascript"${attr}>${fs.readFileSync(path)}</script>`
    : `<script src="${src}" type="text/javascript"></script>`;
};
