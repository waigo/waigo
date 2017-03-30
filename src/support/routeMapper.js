


const route = require('koa-trie-router'),
  util = require('util'),
  queryString = require('query-string');

const waigo = global.waigo,
  _ = waigo._,
  logger = waigo.load('support/logger').create('RouteMapper'),
  errors = waigo.load('support/errors');


const RouteError = exports.RouteError = errors.define('RouteError');

const METHODS = ['GET', 'POST', 'DEL', 'DELETE', 'PUT', 'HEAD'];


/**
 * The route mapper.
 */
class RouteMapper {
  /**
   * Constructor.
   * @param {Object} App Koa App.
   * @constructor
   */
  constructor (App) {
    this.App = App;
  }


  /**
   * Setup routes and middleware.
   * 
   * @param {Object} middlewareConfig Middleware config.
   * @param {Object} routeConfig Route config.
   */
  * setup (middlewareConfig, routeConfig) {
    logger.info('Initialise...');

    require('koa-trie-router')(this.App.koa);

    let possibleMappings = [];

    // resolve middleware for different HTTP methods
    let commonMiddleware = {};
    _.each(METHODS, (method) => {
      logger.debug('Setting up HTTP method middleware', method);

      commonMiddleware[method] = 
        this._loadCfgMiddleware(middlewareConfig[method]);
    });

    // build mappings
    logger.debug('Setting up route mappings');

    _.each(routeConfig, (node, urlPath) => {
      possibleMappings = possibleMappings.concat(
        this._buildRoutes(commonMiddleware, urlPath, node, {
          urlPath: '',
          preMiddleware: [],
        })
      );
    });

    // now order by path (specific to general)
    // put the routes into order (specific to general)
    let orderedMappings = possibleMappings.sort(function(a, b) {
      return a.url < b.url;
    });

    this._routes = {
      all: orderedMappings,
      byName: {}
    };

    // add the handlers to routing
    logger.debug('Building reverse lookup table');

    _.each(orderedMappings, (mapping) => {
      let route = this.App.koa.route(mapping.url);

      route[mapping.method.toLowerCase()].apply(route, mapping.resolvedMiddleware);

      // save to app
      this._routes.byName[mapping.name] = mapping;
    });


    logger.debug('Finalize...');

    this.App.koa.use(this.App.koa.router);
  }


  /**
   * Load and initialise given middleware module.
   * 
   * @param  {Object|String} middlewareName Name of middleware module file or object representing combined name and options: `{ id: <middleware mame>, ...}`.
   * @param  {Object} [middlewareOptions] Middleware options.
   * 
   * @return {Function}
   */
  _loadMiddleware (middlewareName, middlewareOptions) {
    logger.debug('Load middleware', middlewareName, middlewareOptions);

    if (_.isPlainObject(middlewareName)) {
      middlewareOptions = _.omit(middlewareName, 'id');
      middlewareName = middlewareName.id;
    } else {
      // if reference is of form 'moduleName.xx.yy' then it's a controller reference
      if (0 < middlewareName.indexOf('.')) {
        return this._loadController(middlewareName);
      }

      middlewareOptions = middlewareOptions || {};
    }

    return waigo.load(`support/middleware/${middlewareName}`)(this.App, middlewareOptions);
  }



  /**
   * Load given controller method.
   * 
   * @param  {String} controller String of form `<controller path>.<method name>`.
   * 
   * @return {Function}
   */
  _loadController (controller) {
    logger.debug('Load controller', controller);

    let tokens = controller.split('.'),
      controllerPath = tokens,
      methodName = tokens.pop(),
      controllerName = controllerPath.join('.');

    let mod = waigo.load(`controllers/${controllerPath.join('/')}`);

    if (!_.isFunction(mod[methodName])) {
      throw new RouteError(`Unable to find method "${methodName}" on controller "${controllerName}"`);
    }

    return mod[methodName];
  }



  /**
   * Load middleware specified in given config object.
   * 
   * @return {Array}
   */
  _loadCfgMiddleware (cfg) {
    logger.debug('Load middleware specified in config');

    cfg = cfg || {};

    return _.map(cfg._order, (m) => {
      return this._loadMiddleware(m, cfg[m]);
    });
  }




  /** 
   * Build URL to given route.
   * 
   * @param  {String} routeName   Name of route.
   * @param  {Object} [urlParams]   URL params for route.
   * @param  {Object} [queryParams] URL query params.
   * @param {Object} [options] Options.
   * @param {Boolean} [options.absolute] If `true` then return absolute URL including site base URL.
   * @return {String}             Route URL
   */
  url (routeName, urlParams, queryParams, options) {
    options = _.extend({
      absolute: false
    }, options);

    logger.debug('Generate URL for route ' + routeName);

    var route = this._routes.byName[routeName];

    if (!route) {
      throw new Error('No route named: ' + routeName);
    }

    var str = options.absolute ? this.App.config.baseURL : '';

    str += route.url;

    // route params
    _.each(urlParams, function(value, key) {
      str = str.replace(`:${key}`, value);
    });

    // query params
    if (!_.isEmpty(queryParams)) {
      str += '?' + queryString.stringify(queryParams);
    }

    return str;
  }


  /**
   * Build routes from given configuration config node.
   * 
   * @param  {Object} commonMiddleware Common middleware to use for every route.
   * @param  {Object} urlPath URL path of this node (relative to parent URL path).
   * @param  {Object} node Config node.
   * @param  {Object} parentConfig parent node config. 
   * @param  {Object} parentConfig.urlPath URL path of parent node.
   * @param  {Object} parentConfig.preMiddleware Resolved pre-middleware for all routes in this node.
   * 
   * @return {Array} List of route mappings.
   */
  _buildRoutes (commonMiddleware, urlPath, node, parentConfig) {
    urlPath = parentConfig.urlPath + urlPath;

    logger.debug('Build route', urlPath);

    // make a shallow copy (so that we can delete keys from it)
    node = _.extend({}, node);

    // load parent middleware
    let resolvedPreMiddleware = parentConfig.preMiddleware.concat(
      _.map(node.pre || [], _.bind(this._loadMiddleware, this))
    );
    delete node.pre;

    let mappings = [];

    // iterate through each possible method
    _.each(METHODS , (method) => {
      if (node[method]) {
        let routeMiddleware = _.isArray(node[method]) ? node[method] : [node[method]];

        mappings.push({
          method: method,
          name: node.name || urlPath,
          url: urlPath,
          resolvedMiddleware: commonMiddleware[method].concat(
            resolvedPreMiddleware, 
            _.map(routeMiddleware, (rm) => {
              return this._loadMiddleware(rm);
            })
          )
        });
      }

      delete node[method];
    });

    // delete name
    delete node.name;

    // go through children
    _.each(node || {}, (subNode, subUrlPath) => {
      mappings = mappings.concat(
        this._buildRoutes(commonMiddleware, subUrlPath, subNode, {
          urlPath: urlPath,
          preMiddleware: resolvedPreMiddleware,
        })
      );
    });

    return mappings;
  }

}


/** 
 * Setup routes.
 * 
 * @param {Object} app Koa app.
 * @param {Object} middlewareConfig Middleware configuration.
 * @param {Object} routeConfig      Route configuration.
 * @return {RouteMapper}
 */
exports.setup = function*(app, middlewareConfig, routeConfig) {
  let mapper = new RouteMapper(app);

  yield mapper.setup(middlewareConfig, routeConfig);

  return mapper;
};






