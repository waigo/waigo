/**
 * JSON  output.
 */


/**
 * Render HTML output.
 * @param templatePath {string} path to rendering template.
 * @param templateData {Object} data to pass to template.
 * @param headers {Object} HTTP headers.
 * @param status {Number} HTTP status code.
 * @param res
 * @param next
 */
exports.render = function(templatePath, templateData, headers, status, res, next) {
  res.send(templateData, headers, status);
};


/**
 * Render the client.
 * @param path {string} path to redirect to.
 * @param status {Number} HTTP status code.
 * @param res
 * @param next
 */
exports.redirect = function(path, status, res, next) {
  res.send({}, { location:  path.toString() }, status || 302);
};

