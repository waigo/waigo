"use strict";

var debug = require('debug')('waigo-acl');

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
      read: {
        role: {
          admin: true
        }
      },
      write: {
        role: {
          admin: true
        }
      }
    }

    this.roles.admin = this.roles.admin || {};
    this.roles.admin.admin = {
      read: true,
      write: true
    }

    // save to db
    this.logger.info('Saving Admin resource rules to db');

    yield this.app.models.Acl.insert({
      resource: 'admin',
      access: 'read',
      entityType: 'role',
      entity: 'admin'
    });
    yield this.app.models.Acl.insert({
      resource: 'admin',
      access: 'write',
      entityType: 'role',
      entity: 'admin'
    });
  }
};



/**
 * Reload the ACL from the database.
 */
ACL.prototype.reload = function*() {
  this.logger.info('Reloading rules from db');

  var data = yield this.app.models.Acl.find({}, {
    raw: true
  });

  var res = this.res = {},
    users = this.users = {},
    roles = this.roles = {};

  data.forEach(function(doc){

    console.log(_.keys(doc[0]));

    // resource perspective
    res[doc.resource] = 
      res[doc.resource] || {};

    res[doc.resource][doc.access] = 
      res[doc.resource][doc.access] || {};

    res[doc.resource][doc.access][doc.entityType] = 
      res[doc.resource][doc.access][doc.entityType] || {};

    res[doc.resource][doc.access][doc.entityType][doc.entity] = true;

    // entity perspsective
    var entity = ('user' === doc.entityType ? users : roles);
    entity[doc.entity] = entity[doc.entity] || {};
    entity[doc.entity][doc.resource] = 
      entity[doc.entity][doc.resource] || {};
    entity[doc.entity][doc.resource][doc.access] = true;
  });
};



/**
 * Get whether given user can read given resource.
 * @param  {String} resource Resource name.
 * @param  {Object} user     User object.
 * @param  {String} access     Access type, `read` or `write`.
 * @return {Boolean} true if allowed; false otherwise.
 */
ACL.prototype.can = function(resource, user, access) {
  this.logger.debug('can', resource, user._id, access);

  // if no entry for resource then all ok
  if (!_.get(this.res, resource)) {
    return true;
  }

  // if user has access then it's ok
  if (_.get(this.users, user._id)) {
    let res = _.get(this.users, user._id + '.' + resource);

    if (res && res[access]) {
      return true;
    }
  }

  // if one of user's roles has access it's ok 
  let roles = user.roles || [];

  for (let i in roles) {
    let role = roles[i];

    let res = _.get(this.roles, roles[i] + '.' + resource);

    if (res && res[access]) {
      return true;
    }
  }

  return false;
};



/**
 * Get whether given user can read given resource.
 * @param  {String} resource Resource name.
 * @param  {Object} user     User object.
 * @param  {String} access     Access type, `read` or `write`.
 * @throws Error if not allowed.
 */
ACL.prototype.assert = function(resource, user, access) {
  this.logger.debug('assert', resource, user._id, access);

  if (!this.can(resource, user, access)) {
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



