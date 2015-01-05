"use strict";


var ProfileSchema = {
  displayName: { type: String, required: true },
};


var EmailSchema: {
  email: { type: String, required: true },
  verified: { type: Boolean },
};


var AuthSchema = {
  type: { type: String, required: true },
  token: { type: String, required: true },
}


module.exports = {
  schema: {
    username: { type: String, required: true },
    profile: { type: ProfileSchema, required: true },
    emails: { type: [EmailSchema], required: true },
    auth: { type: [AuthSchema], required: true },
  },
};

