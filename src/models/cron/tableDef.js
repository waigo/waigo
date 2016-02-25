"use strict";


const LastRunSchema = {
  when: {
    type: Date,
    required: true,
  },
  by: {
    type: String,
    required: true,
  },
};


module.exports = {
  schema: {
    id: { 
      type: String, 
      required: true,
    },
    disabled: {
      type: Boolean,
      required: true,
    },
    lastRun: {
      type: LastRunSchema,
      required: false,
    },
  },
  indexes: [
    {
      name: 'name',
    },
  ],
};


