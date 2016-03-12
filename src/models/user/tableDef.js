"use strict";

const waigo = global.waigo,
  _ = waigo._;



const ProfileSchema = {
  displayName: { type: String, required: true },
};


const EmailSchema = {
  email: { type: String, required: true },
  verified: { type: Boolean },
};


const AuthSchema = {
  type: { type: String, required: true },
  token: { type: String, required: true },
  data: { type: Object },
}



module.exports = {
  schema: {
    username: { 
      type: String, 
      required: true,
    },
    profile: { 
      type: ProfileSchema, 
      required: true,
    },
    emails: { 
      type: [EmailSchema],
      required: true,
    },
    auth: { 
      type: [AuthSchema], 
      required: true,
    },
    roles: { 
      type: [String], 
      required: false,
    },
    lastLogin: { 
      type: Date, 
      required: false,
    },
  },
  virtuals: {
    isAdmin: {
      get: function() {
        return true === _.includes(this.roles, 'admin');
      }
    }
  },
  indexes: [
    {
      name: 'username',
    },
    {
      name: 'email',
      def: function(doc) {
        return doc('emails')('email');
      },
      options: {
        multi: true,
      },
    },
    {
      name: 'roles',
      options: {
        multi: true,
      },
    },  
  ]
};

