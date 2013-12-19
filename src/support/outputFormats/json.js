/**
 * JSON  output.
 */


/**
 * Render HTML output.
 * @param context {Object} request context
 * @param context.res {Object} response object
 * @param context.next {Object} middleware continuation callback
 * @param context.headers {Object} HTTP headers.
 * @param context.status {Number} HTTP status code.
 * @param templatePath {string} path to rendering template.
 * @param templateData {Object} data to pass to template.
 */
exports.render = function(context, templatePath, templateData) {
  context.res.send(templateData, context.headers, context.status);
};


/**
 * Render the client.
 * @param context {Object} request context
 * @param context.res {Object} response object
 * @param context.next {Object} middleware continuation callback
 * @param context.headers {Object} HTTP headers.
 * @param context.status {Number} HTTP status code.
 * @param path {string} path to redirect to.
 */
exports.redirect = function(context, path) {
  context.res.send({}, { location:  path.toString() }, context.status || 302);
};

