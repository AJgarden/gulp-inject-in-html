const fs = require("fs");
const through2 = require("through2").obj;
const PluginError = require("plugin-error");

const injectHTML = require("./lib/inject_html");
const injectCSS = require("./lib/inject_css");
const injectJS = require("./lib/inject_js");
const injectAnnotation = require("./lib/inject_annotation");

const PLUGIN_NAME = "gulp-inject-into-html";

module.exports = function() {
  "use strict";

  const PATTERN = /<\!--\s*inject\((html|css|js)\)(\((async|defer|inject|include)\))*\s*(.*?)\s*-->/gi;

  return through2(function(file, _enc, callback) {
    // if file is empty, donot handle anything and return to next pipe.
    if (file.isNull()) {
      this.push(file);
      return callback();
    }
    // if file cannot be streamed, throw error and stop handleing.
    if (file.isStream()) {
      this.emit("error", new PluginError(PLUGIN_NAME, "Stream not supported"));
      return callback();
    }
    // if file can be buffered, run codes.
    if (file.isBuffer()) {
      let contents = String(file.contents);
      const handles = contents.match(PATTERN); // check if the pattern is existed in file and make an array.
      // if pattern is existed, run codes.
      if (handles !== null) {
        const remains = new Array();
        const injects = new Array();
        for (let i = 0; i < handles.length; i++) {
          const handle = handles[i];
          remains.push(contents.split(handle)[0]);
          if (i + 1 < handles.length) {
            contents = contents.split(handle)[1];
          } else {
            remains.push(contents.split(handle)[1]);
          }
          const extend_html = handle.match(/\(html\)/);
          const extend_css = handle.match(/\(css\)/);
          const extend_js = handle.match(/\(js\)/);
          const js_async = handle.match(/\(async\)/);
          const js_defer = handle.match(/\(defer\)/);
          const type_inject = handle.match(/\(inject\)/);
          const annotation = handle.match(/\{(.*?)\}/);
          const files_start = handle.split("[")[1];
          const files_end = files_start.split("]")[0];
          const files = files_end.split(",");
          let replace = "";
          replace += injectAnnotation(annotation);
          for (let src of files) {
            src = src.trim();
            const path = `${file.base}/${src}`;
            try {
              fs.accessSync(path);
              if (extend_html !== null) {
                // HTML can only be injected into HTML file
                replace += injectHTML(path);
              }
              if (extend_css !== null) {
                replace += injectCSS(type_inject, path, src);
              }
              if (extend_js !== null) {
                replace += injectJS(type_inject, js_async, js_defer, path, src);
              }
            } catch (err) {
              console.log(
                `${PLUGIN_NAME}: ${err}.`
              );
            }
          }
          injects.push(replace);
        }
        let newContents = "";
        for (let i = 0; i < remains.length; i++) {
          newContents += remains[i];
          if (injects[i] !== undefined) {
            newContents += injects[i];
          }
        }
        file.contents = new Buffer.from(newContents);
      }
      this.push(file);
      return callback();
    }
    return callback();
  });
};
