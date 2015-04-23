"use strict";

var co = require('co'),
  debug = require('debug')('waigo-acl');

var waigo = require('../../'),
  _ = waigo._,
  errors = waigo.load('support/errors');


/** ACL error. */
var AclError = exports.AclError = errors.define('AclError');



/** 
 * @constructor
 */
var ACL = exports.ACL = function(app) {
  this.app = app;
  this.logger = app.logger.create('ACL');
};



/**
 * Initialise the ACL.
 */
ACL.prototype.init = function*() {
  this.logger.info('Initialising');

  yield this.reload();

  // access to admin content must be protected
  if (!this.res.admin) {
    this.logger.info('Admin resources rules not found, so creating them now');

    this.res.admin = {
      role: {
        admin: true
      }
    };

    this.roles.admin = this.roles.admin || {};
    this.roles.admin.admin = true;

    // save to db
    this.logger.info('Saving Admin resource rules to db');

    yield this.app.models.Acl.insert({
      resource: 'admin',
      entityType: 'role',
      entity: 'admin'
    });
  }

  // get notified of ACL updates
  yield this.app.models.Acl.addWatcher(_.bind(this.onAclUpdated, this));
};



/**
 * Callback for collection watcher.
 */
ACL.prototype.onAclUpdated = function() {
  var self = this;

  self.app.logger.info('Detected ACL rules change');

  co(this.reload())
    .catch(function(err) {
      self.app.logger.error('Error reloading ACL', err.stack);
    });
};


  

/**
 * Reload the ACL from the database.
 */
ACL.prototype.reload = function*() {
  this.logger.info('Reloading rules from db');

  var data = yield this.app.models.Acl.find({}, {
    rawMode: true
  });

  var res = this.res = {},
    users = this.users = {},
    roles = this.roles = {};

  data.forEach(function(doc){
    // resource perspective
    res[doc.resource] = 
      res[doc.resource] || {};

    res[doc.resource][doc.entityType] = 
      res[doc.resource][doc.entityType] || {};

    res[doc.resource][doc.entityType][doc.entity] = true;

    // entity perspsective
    var entity = ('user' === doc.entityType ? users : roles);
    entity[doc.entity] = entity[doc.entity] || {};
    entity[doc.entity][doc.resource] = true;
  });
};



/**
 * Get whether given user can access given resource.
 * @param  {String} resource Resource name.
 * @param  {Object} user     User object.
 * @return {Boolean} true if allowed; false otherwise.
 */
ACL.prototype.can = function(resource, user) {
  this.logger.debug('can', resource, user._id);

  // if no entry for resource then all ok
  if (!_.get(this.res, resource)) {
    return true;
  }

  // if user has access then it's ok
  if (_.get(this.users, user._id + '.' + resource)) {
    return true;
  }

  // if one of user's roles has access it's ok 
  let roles = user.roles || [];

  for (let i in roles) {
    let role = roles[i];

    if (_.get(this.roles, roles[i] + '.' + resource)) {
      return true;
    }
  }

  return false;
};



/**
 * Get whether given user can access given resource.
 * @param  {String} resource Resource name.
 * @param  {Object} user     User object.
 * @throws Error if not allowed.
 */
ACL.prototype.assert = function(resource, user) {
  this.logger.debug('assert', resource, user._id);

  if (!this.can(resource, user)) {
    throw new AclError('User ' + user._id + ' does not have permission to access ' + resource, 403);
  }
};



/**
 * Initialise ACL
 * @param {App} app           The app.
 */
exports.init = function*(app) {
  var a = new ACL(app);

  yield a.init();

  return a;
};



