"use strict";


module.exports = {
  schema: {
    resource: { 
      type: String, 
      required: true 
    },
    access: { 
      type: String, 
      required: true, 
      enum: ['read', 'write'],
    },
    permission: { 
      type: String, 
      required: true, 
      enum: ['allow', 'deny'],
    },
    entityType: {
      type: String,
      required: true,
      enum: ['role', 'user'],
    },
    entity: {
      type: String,
      required: true,
    }
  },
  methods: {
    /**
     * Get whether given user can access given entity.
     *
     * If a rule is not found then it assumed that the user lacks access. In 
     * other words you must explicitly enable access.
     * 
     * @param {String} resource      The resource the user wishes to access.
     * @param {Object} user          The user.
     * @param {String} user._id      The user id.
     * @param {Array} user.roles      The user's roles.
     * 
     * @return {Boolean} true if access is possible, false if not.
     */
    canRead: function*(resource, user) {
      return yield this.findOne({

      });
    }
  }
};

