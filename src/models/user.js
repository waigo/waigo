"use strict";


var ProfileSchema = {
  displayName: { type: String, required: true },
};


var EmailSchema = {
  email: { type: String, required: true },
  verified: { type: Boolean },
};


var AuthSchema = {
  type: { type: String, required: true },
  token: { type: String, required: true },
}


module.exports = {
  schema: {
    username: { type: String, required: true, index: true },
    profile: { type: ProfileSchema, required: true },
    emails: { type: [EmailSchema], required: true },
    auth: { type: [AuthSchema], required: true },
    roles: { type: [String], required: true },
  },
  indexes: [
    // username
    {
      fields: {
        username: 1
      }
    },
    // emails
    {
      fields: {
        'emails.email': 1
      }
    },
    // roles
    {
      fields: {
        roles: 1
      }
    },
  ]
};

