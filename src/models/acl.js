"use strict";


module.exports = {
  schema: {
    model: { 
      type: String, 
      required: true 
    },
    access: { 
      type: String, 
      required: true, 
      enum: ['read', 'write'] 
    },
    permission: { 
      type: String, 
      required: true, 
      enum: ['allow', 'deny']
    },
    entityType: {
      type: String,
      required: true,
      enum: ['role', 'user']
    },
    entity: {
      type: String,
      required: true,
    }
  },
};

