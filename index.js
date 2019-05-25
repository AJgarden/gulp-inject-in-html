const fs = require('fs');
const through2 = require('through2').obj;
const PluginError = require('plugin-error');

const PLUGIN_NAME = 'gulp-inject-into-html';

module.exports = function() {
  'use strict';

  const PATTERN = /<\!--\s*inject\((html|css|js)\)(\((async|defer|inject|include)\))*\s*(.*?)\s*-->/gi;

  return through2(function(file, _enc, callback) {
    // if file is empty, donot handle anything and return to next pipe.
    if (file.isNull()) {
      this.push(file);
      return callback();
    }
    // if file cannot be streamed, throw error and stop handleing.
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Stream not supported'));
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
        for (let i=0; i<handles.length; i++) {
          const handle = handles[i];
          remains.push(contents.split(handle)[0]);
          if (i+1 < handles.length) {
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
          const files_start = handle.split('[')[1];
          const files_end = files_start.split(']')[0];
          const files = files_end.split(',')
          let replace = '';
          for (let src of files) {
            src = src.trim();
            const path = `${file.base}/${src}`;
            try {
              fs.accessSync(path);
              if (extend_html !== null) {
                // HTML can only be injected into HTML file
                replace += fs.readFileSync(path);
              }
              if (extend_css !== null) {
                if (type_inject !== null) {
                  replace += `<style>${fs.readFileSync(path)}</style>`;
                } else {
                  replace += `<link href="${src}" rel="stylesheet" />`;
                }
              }
              if (extend_js !== null) {
                let js_attr = '';
                if (js_async !== null) {
                  js_attr += ' async'
                }
                if (js_defer !== null) {
                  js_attr += ' defer'
                }
                if (type_inject !== null) {
                  replace += `<script type="text/javascript"${js_attr}>${fs.readFileSync(path)}</script>`;
                } else {
                  replace += `<script src="${src}" type="text/javascript"></script>`;
                }
              }
            } catch (err) {
              console.log(`${PLUGIN_NAME}: ${err.path} is non-existent that cannot be injected.`);
            }
          }
          injects.push(replace);
        }
        let newContents = '';
        for (let i=0; i<remains.length; i++) {
          newContents += remains[i]
          if (injects[i] !== undefined) {
            newContents += injects[i]
          }
        }
        file.contents = new Buffer.from(newContents);
      }
      this.push(file);
      return callback();
    }
    return callback();
  })
}