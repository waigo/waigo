"use strict";


module.exports = {
  schema: {
    resource: { 
      type: String, 
      required: true,
    },
    access: { 
      type: String, 
      required: true, 
      enum: ['read', 'write'],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['role', 'user'],
    },
    entity: {
      type: String,
      required: true,
      admin: {
        listView: true
      },
    }
  },
  admin: {
    listView: ['resource', 'access', 'entityType', 'entity']
  },
};

