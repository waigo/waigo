const path = require('path'),
  shell = require('shelljs')


const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger').create('StaticResources')




/**
 * Copy all built static resources from plugin and core framework folders into
 * app's folder. And also setup static resource URL helper.
 *
 * @param {Object} app The application.
 */
module.exports = function *(App) {
  App.logger.debug('Copying static resources into public folder')

  const tmpFolder = path.join(shell.tempdir(), 'waigo-app')

  // clean old stuff from tmp folder
  shell.rm('-rf', tmpFolder)

  logger.debug('Copy static resources into', tmpFolder)

  const sources = waigo.getSources()

  for (const key in sources) {
    // skip app's own
    if ('app' === key) {
      continue
    }

    const src = path.join(sources[key], '..', 'public', '*'),
      dst = path.join(tmpFolder, key)

    logger.debug('Copying ' + src + ' -> ' + tmpFolder)

    shell.mkdir('-p', dst)
    shell.cp('-Rf', src, dst)

    // delete _gen folder in dst (if present)
    shell.rm('-rf', path.join(dst, '_gen'))
  }

  const destFolder =
    path.join(waigo.getAppFolder(), App.config.staticResources.folder, '_gen')

  logger.debug('Copy ' + tmpFolder + ' -> ' + destFolder)
  shell.mkdir('-p', destFolder)
  shell.cp('-Rf', path.join(tmpFolder, '*'), destFolder)

  // done with tmp folder
  shell.rm('-rf', tmpFolder)

  // Static URL helper
  App.staticUrl = _.curry(_staticUrl, 2)(logger)
}



/**
 * Helper to generate static URL (relative to base site URL).
 *
 * The given `resourcePath` may be prefixed with `<module name>:`. This is extracted
 * (if present) and used to generate the correct path. If not present then it
 * is assumed that the static resource belongs to the app.
 *
 * @param {String} resourcePath Path to static resource.
 *
 * @return {String}
 */
function _staticUrl (logger, resourcePath) {
  const pos = resourcePath.indexOf(':'),
    owner = (0 <= pos) ? resourcePath.substr(0, pos) : '',
    theUrl = (0 <= pos) ? resourcePath.substr(pos + 1) : resourcePath

  logger.trace('Static resource: ' + resourcePath + ' -> owner:' + owner + ', url:' + theUrl)

  if (
    /* app */
    !owner.length ||
    /* if want 'waigo' resource and the current app is the waigo framework itself */
      ('waigo' === owner && 0 === waigo.getAppFolder().indexOf(waigo.getWaigoFolder()))
  ) {
    return path.join('/', theUrl)
  } else {
    return path.join('/_gen', owner, theUrl)
  }
}
