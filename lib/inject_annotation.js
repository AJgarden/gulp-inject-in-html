module.exports = function injectAnnotation(annotation) {
  return annotation !== null ? `\n<!-- ${annotation[1]} -->` : "";
};
