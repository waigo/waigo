"use strict";

/**
 * Represents system activity
 */


var UserSchema = {
  // unique id (if null then by the system)
  _id: {    
    type: String,
    required: false,
  },
  // friendly display name
  displayName: {
    type: String,
    required: true,
  },
};


module.exports = {
  // Based on https://tools.ietf.org/html/draft-snell-activitystreams-09
  schema: {
    // what
    verb: { 
      type: String, 
      required: true,
    },
    // when 
    published: {
      type: Date,
      required: true,
    },
    // who
    actor: {
      type: UserSchema,
      required: true,
    },
    // additional details
    details: {
      type: Object,
    },
  },
  admin: {
    listView: ['verb', 'actor', 'published']
  },
  indexes: [
    {
      fields: {
        verb: 1
      }, 
    },
    {
      fields: {
        published: -1
      },
    },
    {
      fields: {
        'actor._id': 1
      }
    },
  ],
};

